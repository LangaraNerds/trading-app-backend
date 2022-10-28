const router = require("express").Router();
const {coinSingle,} = require("../controllers/cryptoInfoController")

const {isAuthenticated} = require('../middleware/authMiddleware')

module.exports = function (app) {

    router.post("/", coinSingle);

    app.use('/api/crypto', router)
}
