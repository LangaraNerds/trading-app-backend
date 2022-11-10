const {Schema, model,} = require("mongoose");

const priceAlertSchema = new Schema(
    {
        name: {
            type: String,
            required: [false, 'Please add a Name'],
        },
        user_id: {
            type: String,
        },
        ticker: {
            type: String,
            required: [false, 'Please add an Ticker'],
        },
        price: {
            type: Number,
            required: [false, 'Please add the Quantity'],
        },
        type: {
            type: String,
        }
    },
    {
        timestamps: true,
    })

module.exports = model("priceAlert", priceAlertSchema);
