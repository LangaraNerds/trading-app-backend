const {ToadScheduler, SimpleIntervalJob, Task} = require('toad-scheduler')
const {pushNotification} = require('./pushNotificationMiddleware');
const LimitOrder = require("../models/limitOrderModel");
const {fetchPrice} = require("../utils/APIs");
const {buyTransaction, coinName, sellTransaction, symbols} = require("../utils/constants");

exports.OrderTasks = () => {

    const scheduler = new ToadScheduler()
    const buyOrder = new Task('Buy Order', async () => {
        for (const coinTicker of symbols) {

            const orderLimit = await LimitOrder.find({ticker: coinTicker, status: 0});
            let price = 0
            const name = coinName(coinTicker)
            let usersId = []
            if (orderLimit) {
                const coinPrice = await fetchPrice(coinTicker)
                const currentPrice = coinPrice.currentPrice
                for (const order of orderLimit) {

                    if (order.typeOrder === 'buy' && currentPrice <= order.price && !order.status) {

                        price = order.price
                        await buyTransaction(coinTicker, order.quantity, order.user_id)
                        usersId.push(order.user_id)
                    }
                }
                if (usersId !== '') {
                    pushNotification(usersId, currentPrice, price, 'buy', name, coinTicker);
                }
            }
        }
    })

    const sellOrder = new Task('Sell Order', async () => {
        for (const coinTicker of symbols) {
            const orderLimit = await LimitOrder.find({ticker: coinTicker, status: 0});
            let price = 0
            const name = coinName(coinTicker)
            let usersId = []
            if (orderLimit) {
                const coinPrice = await fetchPrice(coinTicker)
                const currentPrice = coinPrice.currentPrice
                for (const order of orderLimit) {
                    if (order.typeOrder === 'sell' && currentPrice >= order.price && !order.status) {
                        price = order.price
                        await sellTransaction(coinTicker, order.quantity, order.user_id)
                        usersId.push(order.user_id)
                    }
                }
                if (usersId !== '') {
                    pushNotification(usersId, currentPrice, price, 'sell', name, coinTicker);
                }
            }
        }
    })

    const SellJob = new SimpleIntervalJob({seconds: 30}, sellOrder, {id: 'sell', preventOverrun: true,})
    const BuyJob = new SimpleIntervalJob({seconds: 30}, buyOrder, {id: 'buy', preventOverrun: true,})

    scheduler.addSimpleIntervalJob(SellJob)
    scheduler.addSimpleIntervalJob(BuyJob)

    console.log(scheduler.getById('buy').getStatus());
    console.log(scheduler.getById('sell').getStatus());
}
exports.stopTasks = () => {
    const scheduler = new ToadScheduler()
    scheduler.stop()
}



