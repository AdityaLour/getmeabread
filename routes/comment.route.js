const express = require("express");
const router = express.Router();

const {
  addComment,
  getComments,
} = require("../controllers/comment.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/notes/:id/comments", authMiddleware, addComment);
router.get("/notes/:id/comments", getComments);

module.exports = router;
