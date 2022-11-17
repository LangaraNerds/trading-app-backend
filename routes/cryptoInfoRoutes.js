const router = require("express").Router();
const {coinSingle, trendingCoins, priceAlert, orderLimit} = require("../controllers/cryptoInfoController");

const {isAuthenticated} = require('../middleware/authMiddleware');
module.exports = function (app) {

    router.post("/", coinSingle);
    router.get("/trending", trendingCoins);
    router.post("/alert", priceAlert);
    router.post("/order ", orderLimit);

    app.use('/api/crypto', router)
}
