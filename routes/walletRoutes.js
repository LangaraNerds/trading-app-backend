const router = require("express").Router();
const {userWallet, walletAssets} = require("../controllers/walletController")
const {tradeHistory, tradeQuantity} = require("../controllers/tradeHistoryController")

const {isAuthenticated} = require('../middleware/authMiddleware')

module.exports = function (app) {

    router.post("/", isAuthenticated, userWallet);
    router.post("/assets", isAuthenticated, walletAssets);
    router.post("/history", isAuthenticated, tradeHistory);
    app.use('/api/wallet', router)
}
