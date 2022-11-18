const BuyHistory = require("../models/buyHistoryModel")
const SellHistory = require("../models/sellHistoryModel")
const asyncHandler = require("express-async-handler");


/**
 * @desc  get list of buy and sells
 * @route /api/wallet/history
 * @param userId
 * */
exports.tradeHistory = asyncHandler(async ({body}, res) => {

    try {
        const {userId} = body
        const returnData= {
            quantity:1,
            ticker:1,
            price:1,
            totalPrice:1,
            createdAt:1
        }
        const buy = await BuyHistory.find({user_id: userId},returnData).sort({createdAt: -1})
        const sell = await SellHistory.find({user_id: userId},returnData).sort({createdAt: -1})


        buy.forEach((item) => {
            item._doc.type = "Buy";
        })
        sell.forEach((item) => {
            item._doc.type = "Sell";
        })

        // merge buy and sell and sort
        const tradeInfo = [...buy,...sell].sort((a, b) => {
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