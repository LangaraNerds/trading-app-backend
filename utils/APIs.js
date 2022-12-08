const axios = require("axios");

exports.fetchPrice = async (ticker) => {
    const {data} = await axios.get(`${process.env.PRICE_API}${ticker}`);

    const currentPrice = parseFloat(data.lastPrice);
    const priceChangePercent = parseFloat(data.priceChangePercent);

    return {currentPrice: currentPrice, priceChangePercent: priceChangePercent}
}
