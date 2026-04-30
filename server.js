require("dotenv").config();
const express = require("express");
const PORT = 5000;
const cors = require("cors");

const connectdb = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");
const noteRoutes = require("./routes/note.routes.js");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Working");
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

connectdb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
