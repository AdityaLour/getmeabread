const express = require("express");
const router = express.Router();

const {
  addComment,
  getComments,
} = require("../controllers/comment.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/notes/:id/comments", requireAuth, addComment);
router.get("/notes/:id/comments", getComments);

module.exports = router;
