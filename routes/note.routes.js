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

router.get("/feed", getFeed);
router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);
router.get("/:id", authMiddleware, getNoteById);
router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);

router.get("/users/:username", getUserProfile);
router.post("/:id/toggle-like", authMiddleware, toggleLike);


module.exports = router;
