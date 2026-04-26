console.log("Auth routes loaded");
const express = require("express");
const router = express.Router();
const {signUpUser} = require("../controllers/auth.controller");

router.post("/signup", signUpUser);

module.exports = router;
