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
tweetSentiment(); // initially getting Tweet data
setInterval(function () { tweetSentiment() }, 1200000);

app.get("/test", (req, res) => {
    console.log("Route Works")
    console.log(sentimentData);
    res.send("API WORKS!");
});

function tweetSentiment () {
     // API Call for trending symbols on StockTwits
     axios
     .get("https://api.stocktwits.com/api/2/trending/symbols.json")
     .then((res) => {
         let body = res.data.symbols;
         let cryptos = ['BTC.X', 'ETH.X', 'BCH.X', 'DOGE.X']; // Default Display Cryptos
         for (const row of body) {
             let symbol = row.symbol;
             // Handpicking crypto symbols (has ".X" at the end of the symbol name)
             if (symbol.includes(".X")) {
                 cryptos.push(symbol);
             }
         }
         return cryptos;
     })
     .then((res) => {
         let dict = {}; // Stores symbols as keys and tweets as values   { symbol: [message, message, ...] }
         let cryptos = res;
         // Async function to loop through API calls
         async function getTweets() {
             for (const symbol of cryptos) {
                 await axios
                     .get(`https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`)
                     .then((res) => {
                         let messages = res.data.messages;
                         // Appending keys (symbols) and values (tweets) to the dictionary
                         for (const message of messages) {
                             if (dict.hasOwnProperty(symbol)) {
                                 dict[symbol].push(message.body);
                             } else {
                                 dict[symbol] = [message.body];
                             }
                         }
                     });
             }
             return dict;
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

        // Updating Global Variableçc
        sentimentData = sentimentDict;
        return 1;
     });
    return console.log("Fresh sentiment data is stored.")
}

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});