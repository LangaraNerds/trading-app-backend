const express = require("express");
const router = express.Router();
const { userSignup, userLogin, userLogout, userProfile } = require("../controllers/userController");

const { isAuthenticated } = require('../middleware/authMiddleware')

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/logout", userLogout);

router.post("/me", isAuthenticated, userProfile);

module.exports = router;