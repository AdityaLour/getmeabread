const User = require("../models/user.model");
const Note = require("../models/note.model");
const Like = require("../models/like.model");
const Follow = require("../models/follow.model");
const mongoose = require("mongoose");

async function createNote(req, res) {
  try {
    const { title, content, desc, isPublic } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and Content are required",
      });
    }

    const userId = req.userId;
    console.log("USER ID:", req.userId);
    const newNote = await Note.create({
      title: title,
      content: content,
      desc: desc,
      userId: userId,

      isPublic: isPublic ?? true,
    });
    return res.status(201).json({
      newNote: newNote,
      message: "Note is created",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Create the note",
    });
  }
}

async function getNotes(req, res) {
  try {
    const userId = req.user.id;
    const search = req.query.search?.trim();

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    let query = { userId };

    if (search) {
      query = {
        userId,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ],
      };
    }

    const total = await Note.countDocuments(query);

    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const noteIds = notes.map((note) => note._id);
    const userLikes = await Like.find({
      userId: req.user.id,
      noteId: { $in: noteIds },
    }).lean();

    const likedSet = new Set(userLikes.map((like) => like.noteId.toString()));

    const notesWithLikeInfo = notes.map((note) => ({
      ...note,
      isLiked: likedSet.has(note._id.toString()),
    }));

    return res.status(200).json({
      data: notesWithLikeInfo,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      message: "Notes fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notes",
    });
  }
}

async function getNoteById(req, res) {
  try {
    const note = await Note.findById(req.params.id).populate(
      "userId",
      "username",
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (
      !note.isPublic &&
      (!req.user || note.userId._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let isLiked = false;

    if (req.user) {
      const existingLike = await Like.findOne({
        userId: req.user.id,
        noteId: note._id,
      });

      isLiked = !!existingLike;
    }

    const likesCount = await Like.countDocuments({
      noteId: note._id,
    });

    return res.status(200).json({
      note,
      isLiked,
      likesCount, // 🔥 REQUIRED
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching note" });
  }
}

async function updateNote(req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;
    const { title, content } = req.body;

    const note = await Note.findOne({
      _id: noteId,
      userId: userId,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (!title && !content) {
      return res.status(400).json({
        message: "At least one field (title or content) is required to update",
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;

    await note.save();

    return res.status(200).json({
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Update failed",
    });
  }
}

async function deleteNote(req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const note = await Note.findOne({
      _id: noteId,
      userId: userId,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    await Note.deleteOne({ _id: noteId, userId: userId });
    return res.status(200).json({
      message: "Note is Deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Note Deletion failed",
    });
  }
}

async function getUserProfile(req, res) {
  try {
    const username = req.params.username.trim().toLowerCase();

    const userDoc = await User.findOne({
      username: new RegExp(`^${username}$`, "i"),
    }).select("-password");

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = new mongoose.Types.ObjectId(userDoc._id);
    const currentUserId = req.user ? req.user.id : null;

    const isOwner = currentUserId
      ? currentUserId.toString() === userId.toString()
      : false;

    let filter = { userId };
    if (!isOwner) {
      filter.isPublic = true;
    } else {
      filter.isPublic = req.query.type === "private" ? false : true;
    }

    const [notes, followersCount, followingCount] = await Promise.all([
      Note.find(filter).sort({ createdAt: -1 }).lean(),
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
    ]);

    let isFollowing = false;
    if (currentUserId && !isOwner) {
      const exists = await Follow.exists({
        follower: new mongoose.Types.ObjectId(currentUserId),
        following: userId,
      });
      isFollowing = !!exists;
    }


    return res.json({
      user: {
        ...userDoc.toObject(),
        followersCount,
        followingCount,
      },
      notes,
      isOwner,
      isFollowing,
    });
  } catch (err) {
    console.log("PROFILE ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}

async function getFeed(req, res) {
  try {
    const notes = await Note.find({ isPublic: true })
      .populate("userId", "username")
      .lean();

    const likes = req.userId ? await Like.find({ userId: req.userId }) : [];

    const likedNoteIds = new Set(likes.map((l) => l.noteId.toString()));

    const counts = await Like.aggregate([
      {
        $group: {
          _id: "$noteId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const result = notes.map((note) => ({
      ...note,
      isLiked: likedNoteIds.has(note._id.toString()),
      likesCount: countMap[note._id.toString()] || 0,
    }));

    return res.status(200).json({ notes: result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching feed" });
  }
}

async function search(req, res) {
  try {
    const search = req.query.search?.trim();

    if (!search) {
      return res.json({
        users: { data: [], total: 0, page: 1 },
        notes: { data: [], total: 0, page: 1 },
      });
    }

    const userPage = Math.max(1, parseInt(req.query.userPage) || 1);
    const userLimit = Math.min(20, parseInt(req.query.userLimit) || 5);

    const notePage = Math.max(1, parseInt(req.query.notePage) || 1);
    const noteLimit = Math.min(20, parseInt(req.query.noteLimit) || 5);

    const userSkip = (userPage - 1) * userLimit;
    const noteSkip = (notePage - 1) * noteLimit;

    const noteQuery = {
      isPublic: true,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    };

    const userQuery = {
      $or: [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        ,
      ],
    };

    const [users, notes, totalUsers, totalNotes] = await Promise.all([
      User.find(userQuery)
        .skip(userSkip)
        .limit(userLimit)
        .select("username name")
        .lean(),
      Note.find(noteQuery)
        .skip(noteSkip)
        .limit(noteLimit)
        .populate("userId", "username name")
        .lean(),

      User.countDocuments(userQuery),
      Note.countDocuments(noteQuery),
    ]);

    return res.status(200).json({
      users: {
        data: users,
        page: userPage,
        limit: userLimit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / userLimit),
      },

      notes: {
        data: notes,
        page: notePage,
        limit: noteLimit,
        total: totalNotes,
        totalPages: Math.ceil(totalNotes / noteLimit),
      },
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to Search",
    });
  }
}

async function toggleLike(req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    console.log("toggle like hit:", noteId);

    const existing = await Like.findOne({ userId, noteId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });

      const likesCount = await Like.countDocuments({ noteId });

      return res.status(200).json({
        liked: false,
        likesCount,
      });
    }

    await Like.create({ userId, noteId });

    const likesCount = await Like.countDocuments({ noteId });

    return res.status(200).json({
      liked: true,
      likesCount,
    });
  } catch (err) {
    console.log("ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
module.exports = {
  createNote: createNote,
  getNotes: getNotes,
  getNoteById: getNoteById,
  updateNote: updateNote,
  deleteNote: deleteNote,
  getUserProfile: getUserProfile,
  getFeed: getFeed,
  search: search,
  toggleLike: toggleLike,
};
