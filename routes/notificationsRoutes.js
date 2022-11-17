const router = require("express").Router();
const {AlertTasks} = require("../middleware/priceAlertMiddleware");
const {OrderTasks} = require("../middleware/limitOrderMiddleware");

module.exports = function (app) {

    router.get("/alert", [AlertTasks], (req, res) => {
        res.json({message: "Jobs started!"});
    });
    router.get("/order", [OrderTasks], (req, res) => {
        res.json({message: "Jobs started!"});
    });
    app.use('/task', router)
}