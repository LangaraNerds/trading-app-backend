const Asset = require("../models/assetsModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");


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
