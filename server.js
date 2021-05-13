const st = require('stocktwits');
const axios  = require("axios");
const express = require("express");
const app = express();

const port = 3001;
const hostname = "localhost";
app.use(express.json());


app.get("/test", (req, res) => {
  console.log("hit test");
  st.get('streams/user/StockTwits', {limit:100}, function (err, res) {
    // We parse the JSON to only handpick messages with words only have ing "$" and ".X" which signifies crypto
    console.log(res.body);
  })
  res.send("API WORKS!");
});
 

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
