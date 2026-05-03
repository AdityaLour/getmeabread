const express = require("express");
const router = express.Router();

const { getUserProfile } = require("../controllers/note.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

router.get("/:username", optionalAuth, getUserProfile);

module.exports = router;
