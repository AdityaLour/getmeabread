const User = require("../models/user.model");
const Note = require("../models/note.model");

async function search(req, res) {
  try {
    // 1. SAFE QUERY EXTRACTION
    let q = req.query.q;

    if (Array.isArray(q)) q = q[0];
    q = (q || "").trim();

    // 2. BLOCK EMPTY / SMALL SEARCH
    if (q.length < 1) {
      return res.status(200).json({
        users: [],
        notes: [],
      });
    }

    // 3. SAFE REGEX (NO CRASH)
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    // 4. USERS QUERY (SAFE)
    let users = [];
    try {
      users = await User.find({
        username: { $regex: regex },
      }).select("username");
    } catch (e) {
      console.log("USER SEARCH ERROR:", e.message);
    }

    // 5. NOTES QUERY (VERY IMPORTANT)
    let notes = [];
    try {
      notes = await Note.find({
        isPublic: true,
        $or: [
          { title: { $regex: regex } },
          { content: { $regex: regex } }, // CHANGE IF YOUR FIELD IS DIFFERENT
        ],
      })
        .populate("userId", "username")
        .sort({ createdAt: -1 });
    } catch (e) {
      console.log("NOTE SEARCH ERROR:", e.message);
    }

    // 6. FINAL RESPONSE
    return res.status(200).json({
      users,
      notes,
    });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    return res.status(500).json({
      message: "Search Failed",
    });
  }
}

module.exports = { search };