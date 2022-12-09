const router = require("express").Router();
const {coinSingle, trendingCoins, priceAlert, orderLimit, alertsInfo, orderHistory, ordersActives} = require("../controllers/cryptoInfoController");

const {isAuthenticated} = require('../middleware/authMiddleware');
module.exports = function (app) {

    router.post("/", isAuthenticated, coinSingle);
    router.get("/trending", isAuthenticated, trendingCoins);
    router.post("/alert", isAuthenticated,priceAlert);
    router.post("/alert/info", alertsInfo);
    router.post("/order", isAuthenticated, orderLimit);
    router.post("/order/history", isAuthenticated, orderHistory);
    router.post("/order/active", isAuthenticated, ordersActives);

    app.use('/api/crypto', router)
}
