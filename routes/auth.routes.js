const express = require("express");
const router = express.Router();
const {
  signUpUser,
  loginUser,
  getUser,
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getUserProfile,
  getFeed,
} = require("../controllers/auth.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/me", authMiddleware, getUser);
router.post("/signup", signUpUser);
router.post("/login", loginUser);

router.post("/notes", authMiddleware, createNote);
router.get("/notes", authMiddleware, getNotes);
router.get("/notes/:id", authMiddleware, getNoteById);
router.put("/notes/:id", authMiddleware, updateNote);
router.delete("/notes/:id", authMiddleware, deleteNote);

router.get("/users/:username", getUserProfile);
router.get("/feed", getFeed);

module.exports = router;
