const axios = require("axios");
const express = require("express");
var Sentiment = require("sentiment");
var sentiment = new Sentiment();
const app = express();

const port = 3001;
const hostname = "localhost";
app.use(express.json());

let sentimentData; // Global Variable to Store Data
console.log("Practicing version control line 12");
// how many pages to retrieve from Stocktwits; cannot be less than 1
const paginationCount = 2;

// Get initial Tweet data and set interval to 20 minutes
runAnalysis();
setInterval(runAnalysis, 1200000, paginationCount);

// debug route used to run analysis to get new data
app.get("/debug", async (req, res) => {
    console.log("/debug: Received a debug request for a new sentiment data");
    await runAnalysis();
    console.log(sentimentData);
    res.setHeader("Content-Type", "application/json");
    res.json(sentimentData);
});

// main route returning collected data to client
app.get("/sentiment", (req, res) => {
    console.log("/sentiment: Received a request for sentiment data");
    console.log(sentimentData);
    res.setHeader("Content-Type", "application/json");
    res.json(sentimentData);
});

// main function
async function runAnalysis() {
    console.log("running analysis...");
    let cryptosToAnalyze = await getCryptoSymbols(paginationCount);
    let cryptoTweets = await getCryptoTweets(cryptosToAnalyze);
    sentimentData = runSentimentAnalysis(cryptoTweets);
}

async function getCryptoSymbols() {
    let cryptosToAnalyze = ["BTC.X", "ETH.X", "BCH.X", "DOGE.X"];
    await axios
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

// Use the default and trending crypto symbols to retrieve tweets associated to them
function getCryptoTweets(cryptos) {
    async function getTweets() {
        let cryptoTweets = {}; // { symbol: [message, message, ...] }
        let maxId = 0; // used for pagination
        let tweets = [];

        for (const symbol of cryptos) {
            tweets = [];
            for (let i = 0; i < paginationCount; i++) {
                await axios
                    .get(
                        `https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json?max=${maxId}`
                    )
                    .then((res) => {
                        let messages = res.data.messages;
                        maxId = messages[messages.length - 1].id;

                        for (const message of messages) {
                            tweets.push(message.body);
                        }
                    });
            }
            cryptoTweets[symbol] = tweets;
        }

        return cryptoTweets;
    }

    // necessary for the nested for-loop async function
    async function getCryptoTweetsHelper() {
        return await getTweets();
    }

    return getCryptoTweetsHelper();
}

function runSentimentAnalysis(tweetsDict) {
    let sentimentDict = {};

    // destructure received JSON by each symbol
    Object.entries(tweetsDict).forEach((entry) => {
        const [symbol, tweets] = entry;

        let totalScore = 0;
        let numOfRelevantTokens = 0;

        // run sentiment analysis for each tweet
        for (const tweet of tweets) {
            let sentimentResult = sentiment.analyze(tweet);
            totalScore += sentimentResult.score;
            numOfRelevantTokens += sentimentResult.calculation.length;
        }

        // add analysis data to JSON to be returned
        sentimentDict[symbol] = {
            numberOfTweets: tweets.length,
            totalScore: totalScore,
            avgScore: totalScore / tweets.length,
            numOfRelevantTokens: numOfRelevantTokens,
            totalComparative: ((totalScore / numOfRelevantTokens) * 100) / 5,
        };
    });

    // symbol: {
    //     numberOfTweets: int,
    //     totalScore: int,
    //     avgScore: float,
    //     numOfRelevantTokens: int,
    //     totalComparative: float,
    // }

    return sentimentDict;
}

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
