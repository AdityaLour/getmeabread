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

module.exports = {
  signUpUser: signUpUser,
  loginUser: loginUser,
  getUser: getUser,
};
