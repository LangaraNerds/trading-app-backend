const {ToadScheduler, SimpleIntervalJob, Task} = require('toad-scheduler')
const {pushNotification} = require('./pushNotificationMiddleware');
const LimitOrder = require("../models/limitOrderModel");
const {fetchPrice} = require("../utils/APIs");
const {buyTransaction, coinName, sellTransaction} = require("../utils/constants");


exports.OrderTasks = () => {
    const scheduler = new ToadScheduler()

    const buyBTC = new Task('buy order', async () => {
        console.log('buyBTC');
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
            }
            pushNotification(usersId, coinPrice, price, 'buy', name, coinTicker);

        }
    })

    const sellBTC = new Task('BTCUSDT Alert', async () => {
        console.log('sellBTC');
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
                    await sellTransaction(coinTicker, order.quantity, order.user_id)
                    usersId.push(order.user_id)
                }
            }
            pushNotification(usersId, coinPrice, price, 'sell', name, coinTicker);

        }
    })


    const btcSellJob = new SimpleIntervalJob({seconds: 30,}, sellBTC, {id: 'doge', preventOverrun: true,})
    const btcBuyJob = new SimpleIntervalJob({seconds: 30}, buyBTC, {id: 'btc', preventOverrun: true,})


    // scheduler.addSimpleIntervalJob(btcSellJob)
    scheduler.addSimpleIntervalJob(btcBuyJob)

    console.log(scheduler.getById('btc').getStatus());
}
exports.stopTasks = () => {
    const scheduler = new ToadScheduler()
    scheduler.stop()
}



