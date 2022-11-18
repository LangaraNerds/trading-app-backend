const {ToadScheduler, SimpleIntervalJob, Task} = require('toad-scheduler')
const {pushNotification} = require('./pushNotificationMiddleware');
const LimitOrder = require("../models/limitOrderModel");
const {fetchPrice} = require("../utils/APIs");
const {buyTransaction, coinName} = require("../utils/constants");


exports.OrderTasks = () => {
    const scheduler = new ToadScheduler()

    const buyBTC = new Task('buy order', async () => {
        console.log('dogeAlert');
        const coinTicker = 'BTCUSDT';
        const orderLimit = await LimitOrder.find({ticker: coinTicker});
        let price = 0
        const name = coinName(coinTicker)
        let usersId = []
        if (orderLimit) {
            const coinPrice = await fetchPrice(coinTicker)
            console.log(`market-price: ${coinPrice}`)

            for (const order of orderLimit) {
                if (order.type === 'buy' && coinPrice >= order.price && order.exec === false) {
                    price = order.price
                    await buyTransaction(coinTicker, order.quantity, order.user_id)
                    usersId.push(order.user_id)
                }
                pushNotification(usersId, coinPrice, price, 'buy', name, coinTicker, coinQuantity);
            }

        }

        // const btcAlert = new Task('BTCUSDT Alert', async () => {
        //     console.log('btcAlert');
        //     const coinAlerts = await PriceAlert.find({ticker: "BTCUSDT"});
        //     let usersId = []
        //     if (coinAlerts) {
        //         const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`);
        //         const coinJson = coinFetch.data;
        //         const coinPrice = coinJson.price;
        //         console.log(`market-price: ${coinPrice}`)
        //
        //         for (const alertPrice of coinAlerts) {
        //             console.log(`alert-price ${alertPrice.price}`)
        //
        //             if (alertPrice.type === 'up' && coinPrice >= alertPrice.price && alertPrice.notified === false) {
        //                 usersId.push(alertPrice.user_id)
        //             } else if (alertPrice.type === 'down' && coinPrice <= alertPrice.price && alertPrice.notified === false) {
        //                 usersId.push(alertPrice.user_id)
        //             }
        //             pushNotification(usersId, coinPrice, alertPrice.price, "BTC", "BTCUSDT");
        //         }
        //
        //     }
        // })
        // const dogeJob = new SimpleIntervalJob({seconds: 30,}, dogeAlert, {id: 'doge', preventOverrun: true,})
        const btcJob = new SimpleIntervalJob({seconds: 30}, buyBTC, {id: 'btc', preventOverrun: true,})


       // scheduler.addSimpleIntervalJob(dogeJob)
        scheduler.addSimpleIntervalJob(btcJob)

        console.log(scheduler.getById('btc').getStatus());

    })
}
exports.stopTasks = () => {
    const scheduler = new ToadScheduler()
    scheduler.stop()
}



