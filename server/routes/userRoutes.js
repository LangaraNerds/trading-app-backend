const express = require("express");
const router = express.Router();
const { userSignup, userLogin, userLogout } = require("../controllers/userController");

const { isAuthenticated } = require('../middleware/authMiddleware')

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/logout", userLogout);

module.exports = router;