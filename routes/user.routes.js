const express = require("express");
const router = express.Router();

const { getUserProfile} = require("../controllers/user.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/:username", getUserProfile);

module.exports = router;
