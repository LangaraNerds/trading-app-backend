const User = require("../models/userModel");
const BuyHistory = require("../models/buyHistoryModel")
const SellHistory = require("../models/sellHistoryModel")
const Asset = require("../models/assetsModel");
const asyncHandler = require("express-async-handler");
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
            const currentPrice = coinPrice.currentPrice
            assetBalance = assetBalance + (asset.quantity * currentPrice)
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

    try {

        const assets = await Asset.find({user_id: userId});

        /*
          * To do
          * change to the other api to do only one request
          * */
        let assetArr = []
        for (const asset of assets) {
            let assetBalance = 0
            const coinPrice = await fetchPrice(asset.ticker)
            const currentPrice = coinPrice.currentPrice
            const priceChangePercent = coinPrice.priceChangePercent
            assetBalance = asset.quantity * currentPrice;
            assetArr.push({
                name: asset.name,
                ticker: asset.ticker,
                quantity: asset.quantity,
                priceChangePercent: priceChangePercent,
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

