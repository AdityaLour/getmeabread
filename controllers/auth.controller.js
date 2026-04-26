console.log("Signup route hit");
const User = require("../models/user.model");

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
      const newUser = await User.create({
        name: name,
        password: password,
        email: email,
      });
      return res.status(201).json({
        message: "User created Successfully",
        user: newUser,
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
