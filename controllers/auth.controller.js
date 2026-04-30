const User = require("../models/user.model");
const Note = require("../models/note.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function signUpUser(req, res) {
  try {
    const name = req.body.name;
    const username = req.body.username.trim().toLowerCase();
    const password = req.body.password;
    const email = req.body.email;
    if (
      name &&
      name.length >= 3 &&
      password &&
      password.length >= 6 &&
      email &&
      email.includes("@") &&
      username &&
      username.length >= 3
    ) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        name: name,
        username,
        password: hashedPassword,
        email: email,
      });

      const userObj = newUser.toObject();
      delete userObj.password;
      return res.status(201).json({
        message: "User created Successfully",
        user: userObj,
      });
    } else {
      return res.status(400).json({
        message: "Invalid input",
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }
    return res.status(500).json({
      message: "User Creation Failed",
    });
  }
}

async function loginUser(req, res) {
  const password = req.body.password;
  const email = req.body.email;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (passwordIsCorrect) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        message: "User Logged in  Successfully",
        token,
      });
    }
    return res.status(401).json({
      message: "Invalid credentials",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login Failed",
    });
  }
}

async function getUser(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      message: "failed to Fetch the User",
    });
  }
}

async function createNote(req, res) {
  try {
    const title = req.body.title;
    const content = req.body.content;
    const isPublic = req.body.isPublic;

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
      userId: userId,
      isPublic: isPublic ?? true,
    });
    return res.status(201).json({
      newNote: newNote,
      message: "Note is created",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Create the note",
    });
  }
}

async function getNotes(req, res) {
  try {
    const userId = req.userId;
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

    return res.status(200).json({
      notes,
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
    const noteId = req.params.id;
    const userId = req.userId;

    const note = await Note.findOneAndUpdate(
      {
        _id: noteId,
        $or: [
          {
            isPublic: true,
          },
          {
            userId: userId,
          },
        ],
      },
      {
        $inc: { views: 1 },
      },
      {
        new: true,
      },
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    note.toObject();

    return res.status(200).json({
      note,
      message: "Note Found",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch note",
    });
  }
}

async function updateNote(req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.userId;
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
    const userId = req.userId;

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
    const userName = req.params.username.trim().toLowerCase();

    const user = await User.findOne({ username: userName }).lean();
    if (!user) {
      return res.status(404).json({
        message: "User not Found",
      });
    }

    const notes = await Note.find({ userId: user._id, isPublic: true })
      .sort({ createdAt: -1 })
      .lean();

    delete user.password;

    return res.status(200).json({
      user,
      notes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch the Profile",
    });
  }
}

async function getFeed(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const notes = await Note.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username name")
      .lean();

    const total = await Note.countDocuments({ isPublic: true });

    return res.status(200).json({
      data: notes,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log("ERROR (getFeed):", error);

    return res.status(500).json({
      message: "Failed to fetch feed",
    });
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

module.exports = {
  signUpUser: signUpUser,
  loginUser: loginUser,
  getUser: getUser,
  createNote: createNote,
  getNotes: getNotes,
  getNoteById: getNoteById,
  updateNote: updateNote,
  deleteNote: deleteNote,
  getUserProfile: getUserProfile,
  getFeed: getFeed,
  search: search,
};
