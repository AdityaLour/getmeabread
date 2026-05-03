const express = require("express");
const router = express.Router();

const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getFeed,
  toggleLike,
} = require("../controllers/note.controller");

const { requireAuth, optionalAuth } = require("../middleware/auth.middleware");

router.get(
  "/feed",
  (req, res, next) => {
    console.log("/Feed router hitt");
    next();
  },
  getFeed,
);
router.post("/", requireAuth, createNote);
router.get("/", optionalAuth, getNotes);
router.get("/:id", optionalAuth, getNoteById);
router.put("/:id", requireAuth, updateNote);
router.delete("/:id", requireAuth, deleteNote);
router.post("/:id/toggle-like", requireAuth, toggleLike);

module.exports = router;
