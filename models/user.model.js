const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Must be at least 3 character long"],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, 
      minLength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim :true,
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password should be atleast 6 digits long"],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
