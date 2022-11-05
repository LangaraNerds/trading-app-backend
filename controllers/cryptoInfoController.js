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

        for (let i = 0; i < symbols.length; i++) {
            listOfCoins.push(trendingCoins.find(item => item.symbol === symbols[i]));
        }

        listOfCoins.forEach((coins) => {
            let symbolAndCount = {
                count: coins.count,
                symbol: coins.symbol
            }
            listCoinsWSV.push(symbolAndCount)


        });



        let listSortedCoins = listCoinsWSV.sort((c1, c2) => (c1.count < c2.count) ? 1 : (c1.count > c2.count) ? -1 : 0);


        res.status(200).json({
            success: true,
            message: "Success",
            listSortedCoins: listSortedCoins
        })

    }catch (e) {
        res.status(500).json({success: false, message: e.message});

    }

})
