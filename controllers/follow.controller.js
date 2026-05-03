const mongoose = require("mongoose");
const Follow = require("../models/follow.model");
const User = require("../models/user.model");

async function toggleFollow(req, res) {
  try {
    const targetUsername = req.params.username.trim().toLowerCase();

    const currentUserId = new mongoose.Types.ObjectId(req.user.id);

    const targetUser = await User.findOne({
      username: new RegExp(`^${targetUsername}$`, "i"),
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetUserId = targetUser._id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const existing = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId,
    });

    let isFollowing;

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });
      isFollowing = false;
    } else {
      await Follow.create({
        follower: currentUserId,
        following: targetUserId,
      });
      isFollowing = true;
    }

    const followersCount = await Follow.countDocuments({
      following: targetUserId,
    });

    const followingCount = await Follow.countDocuments({
      follower: targetUserId,
    });

    return res.json({
      isFollowing,
      followersCount,
      followingCount,
    });
  } catch (err) {
    console.log("TOGGLE FOLLOW ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getFollowers(req, res) {
  try {
    const username = req.params.username.toLowerCase();

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followers = await Follow.find({
      following: user._id, // ✅ FIXED
    })
      .populate("follower", "username")
      .lean();

    return res.json({
      followers: followers.map((f) => f.follower),
    });
  } catch (err) {
    console.log("GET FOLLOWERS ERROR:", err);
    return res.status(500).json({
      message: "Error fetching followers",
    });
  }
}

async function getFollowing(req, res) {
  try {
    const username = req.params.username.toLowerCase();

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const following = await Follow.find({
      follower: user._id,
    })
      .populate("following", "username")
      .lean();

    return res.json({
      following: following.map((f) => f.following),
    });
  } catch (err) {
    console.log("GET FOLLOWING ERROR:", err);
    return res.status(500).json({
      message: "Error fetching following",
    });
  }
}

module.exports = {
  toggleFollow,
  getFollowers,
  getFollowing,
};
