const User = require("../models/userModel");
const Asset = require("../models/assetsModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");


/**
 * @desc get top ten users base on their performance and city
 * @route /api/leaderboard
 * @param userId
* */
exports.topTraders = asyncHandler(async ({body}, res) => {
    const {userId} = body
    try { 
        res.status(200).json({ success: true, message: "Top 10 users" });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }


});