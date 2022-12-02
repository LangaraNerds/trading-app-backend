const User = require("../models/userModel");
const Asset = require("../models/assetsModel");
const BuyHistory = require("../models/buyHistoryModel")
const SellHistory = require("../models/sellHistoryModel")
const {fetchPrice} = require("../utils/APIs");
const lodash = require("lodash");
const asyncHandler = require("express-async-handler");
const axios = require("axios");


/**
 * @desc get top ten users base on their performance and city
 * @route /api/leaderboard
 * @param userId
* */
exports.topTraders = asyncHandler(async ({body}, res) => {
    const { city } = body
    try { 

        // console.log("City", city)

        // get all users in the city and their assets
        let aggregateQuery = User.aggregate([
            {
                $match: {
                    "location.city": {
                        $in: [city]
                    }
                    // "email": {
                    //     $in: ["chantour@gmail.com"]
                    // }
                }
            },
            {
                $lookup: {
                    from: "assets",
                    localField: "firebase_uuid",
                    foreignField: "user_id",
                    as: "assets"
                }
            },
        ])
        // aggregateQuery.exec(function(err,res){
        //     console.log("res", res)
        // })

        let totalBalance = 0
        let assetBalance = 0
        let performance = 0
        let topArr = []

        for await (const doc of aggregateQuery) {

            const buy = await BuyHistory.find({user_id: doc.firebase_uuid})
            const sell = await SellHistory.find({user_id: doc.firebase_uuid})

            let totalTrades = buy.length + sell.length
            
            // Minimum of 10 trades
            if(totalTrades > 2){
                let newassets = lodash.groupBy(doc.assets, 'ticker')
            
                for (const [key, value] of Object.entries(newassets)) {
                    // console.log(`${key}: ${value}`);
                    let totalQuantity = 0
                    for (const asset of value) {
                        totalQuantity = totalQuantity + asset.quantity
                    }
                    newassets[key] = totalQuantity
                }
    
                for (const [key, value] of Object.entries(newassets)) {
                    const coinPrice = await fetchPrice(key)
                    assetBalance = assetBalance + (value * coinPrice)
                    totalBalance = doc.wallet.balance + assetBalance
                }
                
                // Calculate score by dividing performance by total trades
                performance = ((parseFloat(totalBalance) - 1000) / 1000 * 100) / totalTrades
    
                topArr.push({
                    email: doc.email,
                    performance: performance
                })
            }

        }

        // Sort by performance and return top 10
        topArr.sort((a, b) => (a.performance > b.performance) ? -1 : 1)
        topArr = topArr.slice(0, 10)

        // console.log("TopArr", topArr)

        res.status(200).json({ success: true, traders: topArr, message: "Top 10 users" });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }


});