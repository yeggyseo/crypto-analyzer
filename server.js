const express = require("express");
const app = express();

const port = 3001;
const hostname = "localhost";

app.get("/test", (req, res) => {
  console.log("hit test");
  res.send("hello!");
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
