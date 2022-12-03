const BuyHistory = require("../models/buyHistoryModel")
const SellHistory = require("../models/sellHistoryModel")
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");


/**
 * @desc  get list of buy and sells
 * @route /api/wallet/history
 * @param userId
 * */
exports.tradeHistory = asyncHandler(async ({body}, res) => {

    try {
        const {userId} = body
        const returnData = {
            quantity: 1,
            ticker: 1,
            price: 1,
            totalPrice: 1,
            createdAt: 1
        }
        const buy = await BuyHistory.find({user_id: userId}, returnData).sort({createdAt: -1})
        const sell = await SellHistory.find({user_id: userId}, returnData).sort({createdAt: -1})


        buy.forEach((item) => {
            item._doc.type = "Buy";
        })
        sell.forEach((item) => {
            item._doc.type = "Sell";
        })

        // merge buy and sell and sort
        const tradeInfo = [...buy, ...sell].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });


        res.status(200).json({
            success: true,
            tradeInfo: tradeInfo,
            message: "Success",

        });

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});
/**
 * @desc  get total quantities of trade
 * @route /api/wallet/trade/quantity
 * @param userId
 * */
exports.tradeQuantity = asyncHandler(async ({body}, res) => {
    try {
        const {userId} = body

        // instead of 2 count it should be done with an aggregation for better performance

        const BuyQuantity = await BuyHistory.count({user_id: userId})
        const SellQuantity = await SellHistory.count({user_id: userId})

        const totalQuantity = BuyQuantity + SellQuantity

        res.status(200).json({
            success: true,
            totalQuantity: totalQuantity,
            message: "Success",

        });

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});
