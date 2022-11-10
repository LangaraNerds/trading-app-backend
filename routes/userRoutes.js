const router = require("express").Router();
const {userSignup, userLogin, userLogout, userProfile, userFCMToken} = require("../controllers/userController");

const {isAuthenticated} = require('../middleware/authMiddleware')

module.exports = function (app) {
    router.post("/signup", userSignup);
    router.post("/login", userLogin);
    router.post("/logout", userLogout);
    router.post("/user/token", userFCMToken);
    router.get("/me", isAuthenticated, userProfile);
    app.use('/api', router)
}


