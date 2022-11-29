const Asset = require("../models/assetsModel");
const User = require("../models/userModel");
const PriceAlert = require("../models/priceAlertModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const {symbols, coinName} = require("../utils/constants");
const LimitOrder = require("../models/limitOrderModel");


/**
 * @desc Show the info for the specific coin
 * @route /api/crypto/
 * @param userId
 * @param coinTicker
 * */
exports.coinSingle = asyncHandler(async ({body}, res) => {

    try {
        const {userId, coinTicker} = body
        const user = await User.findOne({firebase_uuid: userId});
        const asset = await Asset.findOne({user_id: userId, ticker: coinTicker});


        const coinQuantity = asset.quantity
        const balance = user.wallet.balance

        const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coinTicker}`);
        const coinJson = coinFetch.data
        const coinPrice = coinJson.price

        res.status(200).json({
            success: true,
            coinQuantity: coinQuantity,
            usdtBalance: balance,
            currentPrice: coinPrice,
            message: "Success",

        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }

});
/**
 @desc -put description here-
 @route /api/crypto/****
 * */
exports.trendingCoins = asyncHandler(async (req, res) => {
    try {
        const trending = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const trendingCoins = trending.data;
        // const listOfCoins = trendingCoins.find(item => item.symbol === "BTCUSDT" & item.symbol === "BTCUSDT");
        let listOfCoins = [];
        let listCoinsWSV = [];

        for (let i = 0; i < symbols.length; i++) {

            listOfCoins.push(trendingCoins.find(item => item.symbol === symbols[i]));
        }

        const supportedSymbols = [
            "BTCUSDT",
            "ETHUSDT",
            "BNBUSDT",
            "XRPUSDT",
            "ADAUSDT",
            "SOLUSDT",
            "DOGEUSDT",
            "TRXUSDT",
        ];

        listOfCoins.forEach((coins) => {
            // filter out coins that are not supported
            if (supportedSymbols.includes(coins.symbol)) {
                let symbolAndCount = {
                    count: coins.count,
                    symbol: coins.symbol,
                    priceChangePercent: coins.priceChangePercent,
                    lastPrice: coins.lastPrice,
                }
                listCoinsWSV.push(symbolAndCount)
            }
        });


        let listSortedCoins = listCoinsWSV.sort((c1, c2) => (c1.count < c2.count) ? 1 : (c1.count > c2.count) ? -1 : 0);


        res.status(200).json({
            success: true,
            message: "Success",
            listSortedCoins: listSortedCoins
        })

    } catch (e) {
        res.status(500).json({success: false, message: e.message});

    }

})

/**
 * @desc save the price Alert for coin
 * @route /api/crypto/alert
 * @param userId
 * @param coinTicker
 * @param price
 * @param alertType (up, down)
 * */
exports.priceAlert = asyncHandler(async ({body}, res) => {

    const {userId, coinTicker, price, alertType} = body
    try {

        const name = coinName(coinTicker)
        await PriceAlert.create(
            {
                price: price,
                user_id: userId,
                ticker: coinTicker,
                name: name,
                type: alertType
            }
        )
        res.status(200).json({
            success: true,
            message: "Success",
        });

    } catch (error) {
        res.status(500).json({success: false, message: e.message});
    }

});
/**
 * @desc save the price Alert for coin
 * @route /api/crypto/order
 * @param userId
 * @param coinTicker
 * @param price
 * @param typeOrder (buy, sell)
 * @param coinQuantity
 * */
exports.orderLimit = asyncHandler(async ({body}, res) => {

    const {userId, coinTicker, price, typeOrder, coinQuantity} = body
    try {

        const name = coinName(coinTicker)
        await LimitOrder.create(
            {
                price: price,
                user_id: userId,
                ticker: coinTicker,
                name: name,
                typeOrder: typeOrder,
                quantity: coinQuantity
            }
        )
        res.status(200).json({
            success: true,
            message: "Success",
        });
    } catch (error) {
        res.status(500).json({success: false, message: e.message});
    }

});

/**
 * @desc get all the alerts
 * @route /api/crypto/alerts
 * @param userId
 * */
exports.alertsInfo = asyncHandler(async ({body}, res) => {
    try {
        const {userId} = body

        const data = {
            _id: 0,
            __v: 0
        }

        const alertInfo = await PriceAlert.find({user_id: userId}, data);

        res.status(200).json({
            alertsInfo: alertInfo,
            success: true,
            message: "Success",
        });
    } catch (error) {
        res.status(500).json({success: false, message: e.message});
    }

});

/**
 * @desc get all the order history
 * @route /api/crypto/order/history
 * @param userId
 * */
exports.orderHistory = asyncHandler(async ({body}, res) => {
    try {
        const {userId} = body

        const data = {
            _id: 0,
            __v: 0
        }

        const orderHistory = await LimitOrder.find({user_id: userId}, data);

        res.status(200).json({
            orderHistory: orderHistory,
            success: true,
            message: "Success",
        });
    } catch (error) {
        res.status(500).json({success: false, message: e.message});
    }

});

/**
 * @desc get all the order history
 * @route /api/crypto/order/actives
 * @param userId
 * */
exports.ordersActives = asyncHandler(async ({body}, res) => {
    try {
        const {userId} = body

        const data = {
            _id: 0,
            __v: 0
        }

        const ordersActives = await LimitOrder.find({user_id: userId, status: false}, data);

        res.status(200).json({
            ordersActives: ordersActives,
            success: true,
            message: "Success",
        });
    } catch (error) {
        res.status(500).json({success: false, message: e.message});
    }

});
