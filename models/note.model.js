const mongoose = require("mongoose");

const { Schema } = mongoose;

const NoteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      minLength: [15, "Write at least 15 characters"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Note = mongoose.model("Note", NoteSchema);
module.exports = Note;
