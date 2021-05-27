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

// how many pages to retrieve from Stocktwits
const paginationCount = 2;

tweetSentiment(paginationCount); // initially getting Tweet data
setInterval(tweetSentiment, 1200000, paginationCount);

app.get("/debug", (req, res) => {
    console.log("Received a debug request for a new sentiment data");
    tweetSentiment(paginationCount);
    console.log(sentimentData);
});

app.get("/sentiment", (req, res) => {
    console.log("Received a request for sentiment data");
    res.send(sentimentData);
});

function tweetSentiment(paginationCount) {
    axios
        // Call Stocktwits API to retrieve trending symbols
        .get("https://api.stocktwits.com/api/2/trending/symbols.json")
        .then((res) => {
            let symbols = res.data.symbols;

            // Array to store default crypto symbols and trending crypto symbols
            let cryptosToAnalyze = ["BTC.X", "ETH.X", "BCH.X", "DOGE.X"];

            for (const row of symbols) {
                let symbol = row.symbol;

                // Handpicking tredning crypto symbols (crypto symbols have ".X" at the end of their names)
                if (symbol.includes(".X")) {
                    cryptosToAnalyze.push(symbol);
                }
            }
            return cryptosToAnalyze;
        })
        // Use the default and trending crypto symbols to retrieve tweets associated to them
        .then((res) => {
            let tweetsDict = {}; // { symbol: [message, message, ...] }
            let cryptos = res;

            // Async function to retrieve associated tweets
            async function getTweets() {
                let maxId = 0;
                for (const symbol of cryptos) {
                    for (let i = 0; i < paginationCount; i++) {
                        await axios
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
                                    if (tweetsDict.hasOwnProperty(symbol)) {
                                        tweetsDict[symbol].push(message.body);
                                    } else {
                                        tweetsDict[symbol] = [message.body];
                                    }
                                }
                            });
                    }
                }
                return tweetsDict;
            }

            async function finalDict() {
                return await getTweets();
            }

            return finalDict();
        })
        .then((res) => {
            let sentimentDict = {};

            // destructure received JSON by each symbol
            Object.entries(res).forEach((entry) => {
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

            // Update Global Variable
            sentimentData = sentimentDict;
        });
    return console.log("New sentiment data is stored.");
}

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
