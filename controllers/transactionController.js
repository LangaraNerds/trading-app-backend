const Asset = require("../models/assetsModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");


exports.buyCoin = asyncHandler(async ({body}, {status}) => {
    const {userId, amount, coinTicker} = body

    try {

        const user = await User.findOne({firebase_uuid: userId});
        const asset = await Asset.findOne({user_id: userId, ticker: coinTicker});


        const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coinTicker}`);
        const coinJson = coinFetch.data;
        const coinPrice = coinJson.price

        let balance = user.wallet.balance
        const checkAmount = amount * coinPrice

        if (balance >= checkAmount) {

            const updateAmount = await Asset.updateOne({_id: asset.id},
                {
                    $set: {
                        quantity: amount
                    }
                }
            )
            if (updateAmount) {

                balance = balance - (amount * coinPrice)
                await User.updateOne({_id: user.id}, {
                    $set: {
                        "wallet.balance": balance,
                    }
                })
            }
            // status 201 return amount and run for the hug
            status(201).json({
                success: true,
                coinAmount: amount,
                message: "Success",
            });
        } else {
            status(401).json({
                success: true,
                message: "sorry, something went wrong",
            });
        }
    } catch (error) {
        console.log(error);
        status(500).json({success: false, message: error.message});
    }
});
