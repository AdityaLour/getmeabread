console.log("Server file loaded");
require("dotenv").config();
const express = require("express");
const PORT = 5000;

const connectdb = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Working");
});

app.use("/api/auth", authRoutes);

connectdb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
