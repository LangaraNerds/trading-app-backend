const User = require("../models/userModel");
const Asset = require("../models/assetsModel");
const {fetchPrice} = require("./APIs");
const BuyHistory = require("../models/buyHistoryModel");


exports.symbols = [
    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "SOLUSDT",
    "DOGEUSDT",
    "TRXUSDT",
];


exports.coinName = (ticker) => {

    let coinName = '';

    switch (ticker) {
        case ticker = "BTCUSDT":
            coinName = "Bitcoin"
            break;
        case ticker = "ETHUSDT":
            coinName = "Ethereum"
            break;
        case ticker = "BNBUSDT":
            coinName = "Binance Coin"
            break;
        case ticker = "XRPUSDT":
            coinName = "Ripple"
            break;
        case ticker = "ADAUSDT":
            coinName = "Cardano"
            break;
        case ticker = "SOLUSDT":
            coinName = "Solano"
            break;
        case ticker = "DOGEUSDT":
            coinName = "Dogecoin"
            break;
        case ticker = "TRXUSDT":
            coinName = "Tron"
            break;
    }
    return coinName;
}


exports.buyTransaction = async (coinTicker, coinQuantity, user_id) => {
    try {

        const user = await User.findOne({firebase_uuid: user_id});
        const asset = await Asset.findOne({user_id: user_id, ticker: coinTicker});
        const coinPrice = await fetchPrice(coinTicker);
        const assetAmount = asset.quantity

        let balance = user.wallet.balance
        const checkAmount = coinQuantity * coinPrice
        if (balance >= checkAmount) {

            let newAmount = assetAmount + coinQuantity;

            const updateAmount = await Asset.updateOne({_id: asset.id},
                {
                    $set: {
                        quantity: newAmount
                    }
                }
            )
            if (updateAmount) {
                let totalPrice = (coinQuantity * coinPrice)
                balance = balance - totalPrice
                await User.updateOne({_id: user.id}, {
                    $set: {
                        "wallet.balance": balance,
                    }
                })
                await BuyHistory.create({
                    user_id: user_id,
                    ticker: coinTicker,
                    quantity: coinQuantity,
                    price: coinPrice,
                    totalPrice: totalPrice
                })
            }

        }
    } catch (error) {
        throw error
    }
}

exports.seedAssets = async  (user_id) => {
    try {
        await Asset.insertMany([
            {
                name: "Bitcoin",
                ticker: "BTCUSDT",
                user_id: user_id
            },
            {
                name: "Ethereum",
                ticker: "ETHUSDT",
                user_id: user_id
            },
            {
                name: "Binance Coin",
                ticker: "BNBUSDT",
                user_id: user_id
            },
            {
                name: "Ripple",
                ticker: "XRPUSDT",
                user_id: user_id
            },
            {
                name: "Cardano",
                ticker: "ADAUSDT",
                user_id: user_id
            },
            {
                name: "Solano",
                ticker: "SOLUSDT",
                user_id: user_id
            },
            {
                name: "Dogecoin",
                ticker: "DOGEUSDT",
                user_id: user_id
            },
            {
                name: "Tron",
                ticker: "TRXUSDT",
                user_id: user_id
            },

        ])
    } catch (error) {
        throw error
    }
}