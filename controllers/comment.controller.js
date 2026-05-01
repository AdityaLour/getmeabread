const User = require("../models/user.model");
const Note = require("../models/note.model");
const Comment = require("../models/comment.model");
const { default: mongoose } = require("mongoose");

async function addComment(req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.userId;
    const text = req.body.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: "Enter text to comment",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        message: "Invalid note id",
      });
    }
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    let newComment = await Comment.create({
      userId: userId,
      noteId: noteId,
      text: text,
    });

    newComment = await newComment.populate("userId", "username");

    return res.status(201).json({
      message: "Comment added successfully",
      newComment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "failed to add Comment",
    });
  }
}

async function getComments(req, res) {
  try {
    const noteId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        message: "Invalid Note id",
      });
    }

    const comments = await Comment.find({ noteId: noteId })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch the comments",
    });
  }
}

module.exports = {
  addComment,
  getComments,
};
