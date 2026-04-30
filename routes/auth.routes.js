const express = require("express");
const router = express.Router();
const {
  signUpUser,
  loginUser,
  getUser,
} = require("../controllers/auth.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/me", authMiddleware, getUser);
router.post("/signup", signUpUser);
router.post("/login", loginUser);

module.exports = router;
