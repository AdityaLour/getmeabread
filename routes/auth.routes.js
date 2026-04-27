const express = require("express");
const router = express.Router();
const {
  signUpUser,
  loginUser,
  getUser,
  createNote,
  getNotes,
  getNoteById,
  updateNote
} = require("../controllers/auth.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/profiles", authMiddleware, getUser);

router.post("/signup", signUpUser);
router.post("/login", loginUser);

router.post("/notes", authMiddleware, createNote);
router.get("/notes", authMiddleware, getNotes);


router.get("/notes/:id", authMiddleware, getNoteById)
router.put("/notes/:id", authMiddleware, updateNote);

module.exports = router;
