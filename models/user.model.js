const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Must be at least 3 character long"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: [6, "Password should be atleast 6 digits long"],
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
