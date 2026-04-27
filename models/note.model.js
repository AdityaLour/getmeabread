const mongoose = require("mongoose");

const { Schema } = moongoose;

const NoteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      minLength: ["Write at least 15 characters", 15],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Note = mongoose.model("Note", NoteSchema);
module.exports = Note;
