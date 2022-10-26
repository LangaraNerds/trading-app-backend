const router = require("express").Router();
const {userSignup, userLogin, userLogout, userProfile} = require("../controllers/userController");
const {userWallet} = require("../controllers/walletController")

const {isAuthenticated} = require('../middleware/authMiddleware')

module.exports = function (app) {
    router.post("/signup", userSignup);
    router.post("/login", userLogin);
    router.post("/logout", userLogout);
    router.post("/wallet", userWallet);
    router.get("/me", isAuthenticated, userProfile);
    app.use('/api', router)
}


