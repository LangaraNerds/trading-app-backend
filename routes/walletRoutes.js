const router = require("express").Router();
const {userWallet, walletAssets} = require("../controllers/walletController")
const {tradeHistory, tradeQuantity} = require("../controllers/tradeHistoryController")

const {isAuthenticated} = require('../middleware/authMiddleware')

module.exports = function (app) {

    router.post("/", userWallet);
    router.post("/assets", walletAssets);
    router.post("/history", tradeHistory);
    app.use('/api/wallet', router)
}
