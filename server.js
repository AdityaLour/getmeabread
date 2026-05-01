require("dotenv").config();
const express = require("express");
const PORT = 5000;
const cors = require("cors");

const connectdb = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");
const noteRoutes = require("./routes/note.routes.js");
const commentRoutes = require("./routes/comment.route.js");
const searchRoutes = require("./routes/search.routes.js");

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Working");
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api", commentRoutes);
app.use("/api/search", searchRoutes);

connectdb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
