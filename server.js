require("dotenv").config();
const express = require("express");
const PORT = 5000;

const connectdb = require("./config/db.js");

const app = express();

app.get("/", (req, res) => {
  res.send("Working");
});

connectdb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
