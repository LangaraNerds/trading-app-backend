const Asset = require("../models/assetsModel");
const User = require("../models/userModel");
const BuyHistory = require("../models/buyHistoryModel")
const SellHistory = require("../models/sellHistoryModel")
const asyncHandler = require("express-async-handler");
const axios = require("axios");


/**
 * @desc buy crypto coin
 * @route /api/buy
 * @param userId
 * @param coinAmount
 * @param coinTicker
 * */
exports.buyCoin = asyncHandler(async ({body}, res) => {
    //rename amount to coinAmount
    const {userId, amount, coinTicker} = body

    try {

        const user = await User.findOne({firebase_uuid: userId});
        const asset = await Asset.findOne({user_id: userId, ticker: coinTicker});

        const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coinTicker}`);
        const coinJson = coinFetch.data
        const coinPrice = coinJson.price
        const assetAmount = asset.quantity

        let balance = user.wallet.balance
        const checkAmount = amount * coinPrice
        const totalPrice = amount * coinPrice

        if (balance >= checkAmount) {

            let newAmount = assetAmount + amount;

            const updateAmount = await Asset.updateOne({_id: asset.id},
                {
                    $set: {
                        quantity: newAmount
                    }
                }
            )
            if (updateAmount) {
                let totalPrice = (amount * coinPrice)
                balance = balance - totalPrice
                await User.updateOne({_id: user.id}, {
                    $set: {
                        "wallet.balance": balance,
                    }
                })
                await BuyHistory.create({
                    user_id: userId,
                    ticker: coinTicker,
                    quantity: amount,
                    price: coinPrice,
                    totalPrice: totalPrice
                })
            }
            // status 201 return amount and run for the hug
            res.status(201).json({
                success: true,
                coinAmount: amount,
                totalPrice: totalPrice,
                message: "Success",
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Not enough Money",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message});
    }
});

/**
 * @desc buy crypto coin
 * @route /api/buy
 * @param userId
 * @param coinAmount
 * @param coinTicker
 * */
exports.sellCoin = asyncHandler(async ({body}, res) => {
    const {userId, amount, coinTicker} = body

    try {

        const user = await User.findOne({firebase_uuid: userId});
        const asset = await Asset.findOne({user_id: userId, ticker: coinTicker});

        const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coinTicker}`);
        const coinJson = coinFetch.data;
        const coinPrice = coinJson.price;

        let assetQuantity = asset.quantity;
        let balance = user.wallet.balance;

        balance = balance + (amount * coinPrice);
        const totalPrice = amount * coinPrice;
        if (assetQuantity >= amount) {
            const updateBalance = await User.updateOne({_id: user.id}, {
                $set: {
                    "wallet.balance": balance,
                }
            })

            if (updateBalance) {
                assetQuantity = assetQuantity - amount
                await Asset.updateOne({_id: asset.id},
                    {
                        $set: {
                            quantity: assetQuantity
                        }
                    }
                )
                await SellHistory.create({
                    user_id: userId,
                    ticker: coinTicker,
                    quantity: amount,
                    price: coinPrice,
                    totalPrice: totalPrice
                })

            }
            // status 201 return amount and run for the hug
            res.status(201).json({
                success: true,
                coinAmount: amount,
                totalPrice: totalPrice,
                message: "Success",
            });
        } else {
            res.status(500).json({success: false, message: `something happened`});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message});
    }
});

