const router = require("express").Router();
const {coinSingle, trendingCoins,} = require("../controllers/cryptoInfoController")

const {isAuthenticated} = require('../middleware/authMiddleware')

module.exports = function (app) {

    router.post("/", coinSingle);
    router.get("/trending", trendingCoins);

    app.use('/api/crypto', router)
}
