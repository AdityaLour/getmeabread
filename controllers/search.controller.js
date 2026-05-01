const User = require("../models/user.model");
const Note = require("../models/note.model");

async function search(req, res) {
  try {
    const q = req.query.q?.trim();

    if (!q) {
      return res.status(200).json({
        user: [],
        notes: [],
      });
    }

    const regex = new RegExp(q, "i");
    const users = await User.find({
      $or: [{ username: regex }, { name: regex }],
    }).select("username name");

    const notes = await Note.find({
      $or: [{ title: regex }, { content: regex }],
      isPublic: true,
    }).populate("userId", "username");

    return res.status(200).json({
      users,
      notes,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Search Failed",
    });
  }
}

module.exports = { search };
