const {ToadScheduler, SimpleIntervalJob, Task} = require('toad-scheduler')
const {pushNotification} = require('./pushNotificationMiddleware');
const LimitOrder = require("../models/limitOrderModel");
const {fetchPrice} = require("../utils/APIs");
const {buyTransaction, coinName, sellTransaction, symbols} = require("../utils/constants");


exports.OrderTasks = () => {
    const scheduler = new ToadScheduler()

    const buyBTC = new Task('buy order', async () => {
        for (const coinTicker of symbols) {
            const orderLimit = await LimitOrder.find({ticker: coinTicker});
            let price = 0
            const name = coinName(coinTicker)
            let usersId = []
            if (orderLimit) {
                const coinPrice = await fetchPrice(coinTicker)

                for (const order of orderLimit) {
                    if (order.typeOrder === 'buy' && coinPrice <= order.price && !order.status) {

                        price = order.price
                        await buyTransaction(coinTicker, order.quantity, order.user_id)
                        usersId.push(order.user_id)
                    }
                }
                if (usersId !== '') {
                    pushNotification(usersId, coinPrice, price, 'buy', name, coinTicker);
                }
            }
        }
    })

    const sellBTC = new Task('BTCUSDT Alert', async () => {
        for (const coinTicker of symbols) {
            const orderLimit = await LimitOrder.find({ticker: coinTicker});
            let price = 0
            const name = coinName(coinTicker)
            let usersId = []
            if (orderLimit) {
                const coinPrice = await fetchPrice(coinTicker)


                for (const order of orderLimit) {
                    if (order.typeOrder === 'sell' && coinPrice >= order.price && !order.status) {
                        price = order.price
                        await sellTransaction(coinTicker, order.quantity, order.user_id)
                        usersId.push(order.user_id)
                    }
                }
                if (usersId !== '') {
                    pushNotification(usersId, coinPrice, price, 'sell', name, coinTicker);

                }

            }
        }
    })

    const btcSellJob = new SimpleIntervalJob({seconds: 30}, sellBTC, {id: 'sell', preventOverrun: true,})
    const btcBuyJob = new SimpleIntervalJob({seconds: 30}, buyBTC, {id: 'buy', preventOverrun: true,})


    scheduler.addSimpleIntervalJob(btcSellJob)
    scheduler.addSimpleIntervalJob(btcBuyJob)


    console.log(scheduler.getById('buy').getStatus());
    console.log(scheduler.getById('sell').getStatus());
}
exports.stopTasks = () => {
    const scheduler = new ToadScheduler()
    scheduler.stop()
}



