const axios = require("axios");
const express = require("express");
var Sentiment = require("sentiment");
var sentiment = new Sentiment();
const app = express();

const port = 3001;
const hostname = "localhost";
app.use(express.json());

// Global Variable to Store Data
let sentimentData;

// how many pages to retrieve from Stocktwits; cannot be less than 1
const paginationCount = 1; // TODO: 2

// Get initial Tweet data and set interval
// runAnalysis(paginationCount);
setInterval(runAnalysis, 1200000, paginationCount);

app.get("/debug", (req, res) => {
    console.log("/debug: Received a debug request for a new sentiment data");
    runAnalysis();
    console.log(sentimentData);
});

app.get("/sentiment", (req, res) => {
    console.log("/sentiment: Received a request for sentiment data");
    console.log(sentimentData);
    res.setHeader("Content-Type", "application/json");
    res.json(sentimentData);
});

function runAnalysis() {
    console.log("running analysis...");
    let cryptosToAnalyze = getCryptoSymbols(paginationCount);
    let cryptoTweets = getCryptoTweets(cryptosToAnalyze);
    sentimentData = runSentimentAnalysis(cryptoTweets);

    console.log(sentimentData);
}

function getCryptoSymbols() {
    let cryptosToAnalyze = ["BTC.X"]; // TODO: , "ETH.X", "BCH.X", "DOGE.X"
    axios
        // Call Stocktwits API to retrieve trending symbols
        .get("https://api.stocktwits.com/api/2/trending/symbols.json")
        .then((res) => {
            let symbols = res.data.symbols;

            // Array to store default crypto symbols and trending crypto symbols

            for (const row of symbols) {
                let symbol = row.symbol;

                // Handpicking tredning crypto symbols (crypto symbols have ".X" at the end of their names)
                if (symbol.includes(".X")) {
                    cryptosToAnalyze.push(symbol);
                }
            }
        });
    return cryptosToAnalyze;
}

function getCryptoTweets(cryptos) {
    // DEBUG: function returns an empty array; more explanation below

    // Use the default and trending crypto symbols to retrieve tweets associated to them
    let cryptoTweets = {}; // { symbol: [message, message, ...] }
    let maxId = 0;

    let tweets = [];

    for (const symbol of cryptos) {
        tweets = [];
        for (let i = 0; i < paginationCount; i++) {
            axios
                .get(
                    `https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json?max=${maxId}`
                )
                .then((res) => {
                    let messages = res.data.messages;
                    maxId = messages[messages.length - 1].id;

                    // Appending keys (symbols) and values (tweets) to the dictionary
                    // if there is already a symbol in the dictionary, simply push new data to existing array
                    // otherwise, make a new entry in the dictionary
                    for (const message of messages) {
                        tweets.push(message.body);
                    }
                    // DEBUG: console.log(tweets) here show expected data
                });
        }
        // DEBUG: console.log(tweets) here show empty array
        // DEBUG: I believe it's async issue but I haven't been able to fix it with several combinations of async functions and await
        // DEBUG: doesn't help that Promise object isn't the easiest to extract data from

        cryptoTweets[symbol] = tweets;
    }

    return cryptoTweets;
}

function runSentimentAnalysis(tweetsDict) {
    let sentimentDict = {};

    // destructure received JSON by each symbol
    Object.entries(tweetsDict).forEach((entry) => {
        const [symbol, tweets] = entry;

        let totalScore = 0;
        let totalComparative = 0;

        // run sentiment analysis for each tweet
        for (const tweet of tweets) {
            let sentimentResult = sentiment.analyze(tweet);
            totalScore += sentimentResult.score;
            totalComparative += sentimentResult.comparative;
        }

        // add analysis data to JSON to be returned
        sentimentDict[symbol] = {
            numberOfTweets: tweets.length,
            totalScore: totalScore,
            avg: totalScore / tweets.length,
            totalComparative: totalComparative,
        };
    });

    // symbol: {
    //     numberOfTweets: int,
    //     totalScore: int,
    //     avg: float,
    //     totalComparative: float,
    // }

    return sentimentDict;
}

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
