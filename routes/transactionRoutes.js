const router = require("express").Router();
const { buyCoin } = require("../controllers/transactionController");

const { isAuthenticated } = require('../middleware/authMiddleware');

module.exports = function ( app) {
    router.post("/buy", buyCoin);

    app.use('/api',router)
}

