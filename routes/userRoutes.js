const router = require("express").Router();
const { userSignup, userLogin, userLogout } = require("../controllers/userController");

const { isAuthenticated } = require('../middleware/authMiddleware')

module.exports = function ( app) {
    router.post("/signup", userSignup);
    router.post("/login", userLogin);
    router.post("/logout", userLogout);
    app.use('/api',router)
}


