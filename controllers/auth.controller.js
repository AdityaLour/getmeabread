console.log("Signup route hit");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

async function signUpUser(req, res) {
  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;
  try {
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

module.exports = {
  signUpUser: signUpUser,
};
