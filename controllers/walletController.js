const User = require("../models/userModel");
const BuyHistory = require("../models/buyHistoryModel")
const SellHistory = require("../models/sellHistoryModel")
const Asset = require("../models/assetsModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const {fetchPrice} = require("../utils/APIs");


/**
 * @desc get balance of USDT of user
 * @route /api/wallet
 * @param userId
* */
exports.userWallet = asyncHandler(async ({body}, res) => {
    const {userId} = body

    try {
        const user = await User.findOne({firebase_uuid: userId})

        // instead of 2 count it should be done with an aggregation for better performance
        const BuyQuantity = await BuyHistory.count({user_id: userId})
        const SellQuantity = await SellHistory.count({user_id: userId})

        const totalQuantity = BuyQuantity + SellQuantity

        const assets = await Asset.find({user_id: userId});

        const usdtBalance = user.wallet.balance;
        let totalBalance = 0
        let assetBalance = 0

        for (const asset of assets) {
            const coinPrice = await fetchPrice(asset.ticker)
            assetBalance = assetBalance + (asset.quantity * coinPrice)
            totalBalance = usdtBalance + assetBalance
        }

        res.status(201).json({
            success: true,
            usdtBalance: usdtBalance,
            assetsBalance: assetBalance,
            totalBalance: totalBalance,
            totalQuantity: totalQuantity,
            message: "Success",
        });
    } catch (error) {

        res.status(500).json({success: false, message: error.message});
    }


});

/**
 * @desc get coin with currentPrice and quantity owned
 * @route /api/wallet/assets
 * @param userId
 * */
exports.walletAssets = asyncHandler(async ({body}, res) => {
    const {userId} = body
    // userId = "KItp69rp3LbtIV9l5HseDudsd5P2"
    try {
        const user = await User.findOne({firebase_uuid: userId});


        const assets = await Asset.find({user_id: userId});

        /*https://www.binance.me/api/v3/ticker/price?symbols=%5B"ETHUSDT","BTCUSDT","XRPUSDT"%5D
        * To do
        * change to the other api to do only one request
        * */
        let assetArr = []
        for (const asset of assets) {
            let assetBalance = 0
            const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${asset.ticker}`);
            const coinJson = coinFetch.data
            const coinPrice = coinJson.price
            assetBalance = asset.quantity * coinPrice;
            assetArr.push({
                name: asset.name,
                ticker: asset.ticker,
                quantity: asset.quantity,
                usdtBalance: assetBalance
            })

        }
        res.status(201).json({
            success: true,
            assets: assetArr,
            message: "Success",
        });
    } catch (error) {

        res.status(500).json({success: false, message: error.message});
    }

})

