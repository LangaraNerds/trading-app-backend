const axios = require("axios");

exports.fetchPrice = async (ticker) => {
    const coinFetch = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${ticker}`);
    const coinJson = coinFetch.data;
    return coinJson.price;
}