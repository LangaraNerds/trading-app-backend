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
            const coinAlerts = await PriceAlert.find({ticker: coinTicker});
            let price = 0
            let usersId = []
            if (coinAlerts) {
                const coinPrice = await fetchPrice(coinTicker)
                console.log(`market-price: ${coinPrice}`)

                for (const alertPrice of coinAlerts) {
                    console.log(`alert-price ${alertPrice.price}`)
                    price = alertPrice.price
                    if (alertPrice.type === 'up' && coinPrice >= alertPrice.price && alertPrice.notified === false) {
                        usersId.push(alertPrice.user_id)
                    } else if (alertPrice.type === 'down' && coinPrice <= alertPrice.price && alertPrice.notified === false) {
                        usersId.push(alertPrice.user_id)
                    }
                }
                pushNotification(usersId, coinPrice, price, 'alert', name, coinTicker);
            }
        }
    })

    const alertJob = new SimpleIntervalJob({seconds: 30,}, priceAlert, {id: 'btc', preventOverrun: true,})


    scheduler.addSimpleIntervalJob(btcJob)


    console.log(scheduler.getById('btc').getStatus());

}
exports.stopTasks = () => {
    const scheduler = new ToadScheduler()
    scheduler.stop()
}



