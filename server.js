const axios = require("axios");
const express = require("express");
const app = express();

const port = 3001;
const hostname = "localhost";
app.use(express.json());

app.get("/test", (req, res) => {
    // API Call for trending symbols on StockTwits
    axios
        .get("https://api.stocktwits.com/api/2/trending/symbols.json")
        .then((res) => {
            let body = res.data.symbols;
            let cryptos = [];
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
                        .get(
                            `https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`
                        )
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
            console.log(res);
            //
            // IMPLEMENT SENTIMENTAL ANALYSIS
            // res = { symbol: [message, message, ...] }
            //
            //
            //
            //
        });

    res.send("API WORKS!");
});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
