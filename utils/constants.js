// export const
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