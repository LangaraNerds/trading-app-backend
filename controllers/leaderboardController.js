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
    const { userId, city } = body
    try { 

        // get all users in the city and their assets
        let aggregateQuery = User.aggregate([
            {
                $match: {
                    "location.city": {
                        $in: [city]
                    }
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

            const buy = await BuyHistory.find({user_id: doc.firebase_uuid}).count()
            const sell = await SellHistory.find({user_id: doc.firebase_uuid}).count()

            let totalTrades = buy + sell

            // Minimum of 2 trades
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
                    username: doc.username,
                    id: doc.firebase_uuid,
                    picture: doc.picture ? doc.picture : "https://firebasestorage.googleapis.com/v0/b/trade-up-bc1be.appspot.com/o/user_placeholder.jpg?alt=media&token",
                    performance: performance
                })
            }

        }

        // Sort by performance
        topArr.sort((a, b) => (a.performance > b.performance) ? -1 : 1)

        // find user rank and index
        let index = topArr.findIndex(object => {
            return object.id === userId;
        });

        // if index is -1, user is not found/exist in the array
        let userRank = index !== -1 ? index + 1 : 0

        // slice the array to get top 10
        topArr = topArr.slice(0, 10)

        // add rank to each user
        var rank = 1;
        for (var i = 0; i < topArr.length; i++) {
            topArr[i].rank = rank;
            rank++;
        }

        res.status(200).json({ success: true, rank: userRank, traders: topArr, message: "Success! Here are the Top 10 users" });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }


});