const router = require("express").Router();
const {topTraders} = require("../controllers/leaderboardController")

const {isAuthenticated} = require('../middleware/authMiddleware')

module.exports = function (app) {
    router.post("/", topTraders);
    app.use('/api/leaderboard', router)
}
