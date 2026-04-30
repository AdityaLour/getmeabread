const mongoose = require("mongoose");

const { Schema } = mongoose;

const LikeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

LikeSchema.index({ userId: 1, noteId: 1 }, { unique: true });

const Like = mongoose.model("Like", LikeSchema);

module.exports = Like;
