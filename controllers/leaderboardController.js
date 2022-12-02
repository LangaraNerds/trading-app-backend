const User = require("../models/userModel");
const Asset = require("../models/assetsModel");
const BuyHistory = require("../models/buyHistoryModel")
const SellHistory = require("../models/sellHistoryModel")
const {fetchPrice} = require("../utils/APIs");

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

        console.log("City", city)

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
                    localField: "user_id",
                    foreignField: "firebase_uuid",
                    as: "assets"
                }
            },
            {
                $group: {
                    // '_id': '$users._id',
                    'users_count': {
                        '$sum': {
                            '$cond': [{'$eq': ['$users.role', 'user']}, 1, 0]
                        }
                    },
                    // 'volunteer_count'   : {
                    //     '$sum': {
                    //         '$cond': ['$users.isVolunteer', 1, 0]
                    //     }
                    // },
                    // 'pet_count': { '$sum': 1 },
                    // 'lost_pets': {
                    //     '$sum': {
                    //         '$cond': ['$petLost.lost', 1, 0]
                    //     }
                    // }       
                }
            }
        ]);
        aggregateQuery.exec(function(err,res){
            console.log(res);
        })




        res.status(200).json({ success: true, user: aggregateQuery, message: "Top 10 users" });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }


});