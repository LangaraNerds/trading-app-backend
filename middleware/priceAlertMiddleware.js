const PriceAlert = require("../models/priceAlertModel");
const {ToadScheduler, SimpleIntervalJob, Task} = require('toad-scheduler')
const {pushNotification} = require('./pushNotificationMiddleware');
const {fetchPrice} = require("../utils/APIs");
const {coinName, symbols} = require("../utils/constants");

exports.AlertTasks = () => {

    const scheduler = new ToadScheduler()

    const priceAlert = new Task('Price Alert', async () => {

        for (const coinTicker of symbols) {
            const name = coinName(coinTicker)
            const coinAlerts = await PriceAlert.find({ticker: coinTicker, notified: 0});
            let price = 0
            let usersId = []

            if (coinAlerts) {
                const coinPrice = await fetchPrice(coinTicker)
                for (const alertPrice of coinAlerts) {



                    price = alertPrice.price
                    if (alertPrice.type === 'up' && coinPrice >= alertPrice.price && !alertPrice.notified) {
                        usersId.push(alertPrice.user_id)
                        console.log(alertPrice.user_id)
                    } else if (alertPrice.type === 'down' && coinPrice <= alertPrice.price && !alertPrice.notified) {
                        usersId.push(alertPrice.user_id)
                    }
                }
               await pushNotification(usersId, coinPrice, price, 'alert', name, coinTicker);
            }
        }
    })

    const alertJob = new SimpleIntervalJob({seconds: 30,}, priceAlert, {id: 'priceAlert', preventOverrun: true,})

    scheduler.addSimpleIntervalJob(alertJob)

    console.log(scheduler.getById('priceAlert').getStatus());

}
exports.stopTasks = () => {
    const scheduler = new ToadScheduler()
    scheduler.stop()
}



