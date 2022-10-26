const User = require("../models/userModel");
const Asset = require("../models/assetsModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");

exports.userWallet = async ({body}, res) => {
    const {userId} = body
    // userId = "KItp69rp3LbtIV9l5HseDudsd5P2"
    try {
        const user = await User.findOne({firebase_uuid: userId});

        const assets = await Asset.find({user_id: userId});

        const usdtBalance = user.wallet.balance;
        let totalBalance = 0
        let assetBalance = 0

        /*https://www.binance.me/api/v3/ticker/price?symbols=%5B"ETHUSDT","BTCUSDT","XRPUSDT"%5D
        * To do
        * change to the other api to do only one request
        * */
        for (const asset of assets) {
            const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${asset.ticker}`);
            const coinJson = coinFetch.data
            const coinPrice = coinJson.price
            assetBalance = assetBalance + (asset.quantity * coinPrice)
            totalBalance = usdtBalance + assetBalance
        }
        res.status(201).json({
            success: true,
            usdtBalance: usdtBalance,
            assetsBalance: assetBalance,
            totalBalance: totalBalance,
            message: "Success",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message});
    }


}
