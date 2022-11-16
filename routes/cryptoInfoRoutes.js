const router = require("express").Router();
const {coinSingle, trendingCoins, priceAlert} = require("../controllers/cryptoInfoController");
const PriceAlert = require("../models/priceAlertModel");
const {isAuthenticated} = require('../middleware/authMiddleware');
const priceNotification = require("../middleware/priceAlertMiddleware");
module.exports = function (app) {

    router.post("/", coinSingle);
    router.get("/trending", trendingCoins);
    router.post("/alert", priceAlert);
    router.get('/test', async (req, res) => {
        let arr = []
        const coin = await PriceAlert.find({ticker: "DOGEUSDT"})
        for (alert of coin){
        console.log(alert.price)
            arr.push(alert.price)
        }
console.log(arr)
        res.send({})
    })
    app.use('/api/crypto', router)
}
