const express = require("express");
const router = express.Router();

const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getUserProfile,
  getFeed,
  toggleLike,
} = require("../controllers/note.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/notes", authMiddleware, createNote);
router.get("/notes", authMiddleware, getNotes);
router.get("/notes/:id", authMiddleware, getNoteById);
router.put("/notes/:id", authMiddleware, updateNote);
router.delete("/notes/:id", authMiddleware, deleteNote);

router.get("/users/:username", getUserProfile);
router.get("/feed", getFeed);
router.post("/:id/toggle-like", authMiddleware, toggleLike);


module.exports = router;
