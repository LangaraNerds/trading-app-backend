const Asset = require("../models/assetsModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const {symbols} = require("../utils/constants");


exports.coinSingle = asyncHandler(async ({body}, res) => {

    try {
        const {userId, coinTicker} = body
        const user = await User.findOne({firebase_uuid: userId});
        const asset = await Asset.findOne({user_id: userId, ticker: coinTicker});
        console.log(asset)

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
exports.trendingCoins = asyncHandler( async (req, res) =>{
    try {
        const trending = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const trendingCoins = trending.data;
        // const listOfCoins = trendingCoins.find(item => item.symbol === "BTCUSDT" & item.symbol === "BTCUSDT");
        let listOfCoins = [];
        let listCoinsWSV = [];

        for (i = 0; i < symbols.length; i++) {
            // console.log(symbols[i]);
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

        // console.log(trendingCoins)

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

        //types of 'for`s' "for", "for...of", "for..in", "forEach"

        res.status(200).json({
            success: true,
            message: "Success",
            // trendingCoins: trendingCoins,
            // listOfCoins: listOfCoins
            // listCoinsWSV: listCoinsWSV
            listSortedCoins: listSortedCoins
        })

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }

})
