const router = require("express").Router();
const { buyCoin, sellCoin } = require("../controllers/transactionController");

const { isAuthenticated } = require('../middleware/authMiddleware');

module.exports = function ( app) {
    router.post("/buy", isAuthenticated, buyCoin);
    router.post("/sell", isAuthenticated, sellCoin);

    app.use('/api',router)
}

