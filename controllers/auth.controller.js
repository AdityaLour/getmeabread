const User = require("../models/user.model");
const Note = require("../models/note.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function signUpUser(req, res) {
  try {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    if (
      name &&
      name.length >= 3 &&
      password &&
      password.length >= 6 &&
      email &&
      email.includes("@gmail.com")
    ) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        name: name,
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
    res.status(500).json({
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

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and Content are required",
      });
    }

    const userId = req.userId;
    const newNote = await Note.create({
      title: title,
      content: content,
      userId: userId,
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
    const notes = await Note.find({ userId });

    return res.status(200).json({
      notes,
      message: "Notes Fetched Successfully",
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

    const note = await Note.findOne({
      _id: noteId,
      userId: userId,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

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

module.exports = {
  signUpUser: signUpUser,
  loginUser: loginUser,
  getUser: getUser,
  createNote: createNote,
  getNotes: getNotes,
  getNoteById: getNoteById,
  updateNote : updateNote
};
