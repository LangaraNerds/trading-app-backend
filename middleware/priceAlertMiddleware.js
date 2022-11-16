const axios = require("axios");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const PriceAlert = require("../models/priceAlertModel");
const {ToadScheduler, SimpleIntervalJob, Task} = require('toad-scheduler')
const {pushNotification} = require('./pushNotificationMiddleware');


exports.AlertTasks = () => {
    const scheduler = new ToadScheduler()

    const dogeAlert = new Task('DOGEUSDT Alert', async () => {
        console.log('dogeAlert');
        const coinAlerts = await PriceAlert.find({ticker: "DOGEUSDT"});
        let usersId = []
        if (coinAlerts) {
            const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=DOGEUSDT`);
            const coinJson = coinFetch.data;
            const coinPrice = coinJson.price;
            console.log(`market-price: ${coinPrice}`)

            for (const alertPrice of coinAlerts) {
                console.log(`alert-price ${alertPrice.price}`)
                if (alertPrice.type === 'up') {
                    if (coinPrice >= alertPrice.price && alertPrice.notified === false) {
                        usersId.push(alertPrice.user_id)
                    }
                } else if (alertPrice.type === 'down') {
                    if (coinPrice <= alertPrice.price && alertPrice.notified === false) {
                        usersId.push(alertPrice.user_id)
                    }
                }
            }
            pushNotification(usersId, coinPrice, "DOGE", "DOGEUSDT");
        }

    })

    const btcAlert = new Task('BTCUSDT Alert', async () => {
        console.log('btcAlert');
        const coinAlerts = await PriceAlert.find({ticker: "BTCUSDT"});
        let usersId = []
        if (coinAlerts) {
            const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`);
            const coinJson = coinFetch.data;
            const coinPrice = coinJson.price;
            console.log(`market-price: ${coinPrice}`)

            for (const alertPrice of coinAlerts) {
                console.log(`alert-price ${alertPrice.price}`)

                if (alertPrice.type === 'up') {
                    if (coinPrice >= alertPrice.price && alertPrice.notified === false) {
                        usersId.push(alertPrice.user_id)
                    }
                } else if (alertPrice.type === 'down') {
                    if (coinPrice <= alertPrice.price && alertPrice.notified === false) {
                        usersId.push(alertPrice.user_id)
                    }

                }
                pushNotification(usersId, coinPrice, "BTC", "BTCUSDT");
            }

        }
    })
    const dogeJob = new SimpleIntervalJob({seconds: 30,}, dogeAlert, {id: 'doge', preventOverrun: true,})
    const btcJob = new SimpleIntervalJob({seconds: 30,}, btcAlert, {id: 'btc', preventOverrun: true,})


    scheduler.addSimpleIntervalJob(dogeJob)
    scheduler.addSimpleIntervalJob(btcJob)

    console.log(scheduler.getById('doge').getStatus());

}
exports.stopTasks = () => {
    const scheduler = new ToadScheduler()
    scheduler.stop()
}



