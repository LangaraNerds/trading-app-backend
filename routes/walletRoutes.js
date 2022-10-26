const router = require("express").Router();
const {userWallet, walletAssets} = require("../controllers/walletController")

const {isAuthenticated} = require('../middleware/authMiddleware')

module.exports = function (app) {

    router.post("/", userWallet);
    router.post("/assets", walletAssets);
    app.use('/api/wallet', router)
}
