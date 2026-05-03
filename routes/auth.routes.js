const express = require("express");
const router = express.Router();
const {
  signUpUser,
  loginUser,
  getUser,
} = require("../controllers/auth.controller");

const {
  authMiddleware,
  optionalAuth,
  requireAuth,
} = require("../middleware/auth.middleware");

router.get("/me", optionalAuth, getUser);
router.post("/signup", signUpUser);
router.post("/login", loginUser);

module.exports = router;
