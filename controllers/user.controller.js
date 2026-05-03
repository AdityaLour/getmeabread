const User = require("../models/user.model");
const Note = require("../models/note.model");

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select(
      "username followers following"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // show ONLY public notes (your rule)
    const notes = await Note.find({
      userId: user._id,
      isPublic: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
      },
      notes,
    });
  } catch (err) {
    console.log("PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserProfile };