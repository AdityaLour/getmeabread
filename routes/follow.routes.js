const express = require("express");
const router = express.Router();

const {
  toggleFollow,
  getFollowers,
  getFollowing,
} = require("../controllers/follow.controller");
const { requireAuth, optionalAuth } = require("../middleware/auth.middleware");

router.post("/:username/toggle", requireAuth, toggleFollow);

router.get("/:username/followers", optionalAuth, getFollowers);

router.get("/:username/following", optionalAuth, getFollowing);

module.exports = router;
