const {Schema, model,} = require("mongoose");

const sellHistorySchema = new Schema(
    {
        name: {
            type: String,
            required: [false, 'Please add a Name'],
        },
        user_id: {
            type: String,
        },
        quantity: {
            type: Number,
            required: [false, 'Please add the Quantity'],

        },
        ticker: {
            type: String,
            required: [false, 'Please add an Ticker'],
        },
        price: {
            type: Number,
            required: [false, 'Please add the Quantity'],
        },
        createdAt: {
            type: Date,
            required: false,
            default: Date.now
        },
    },
    {
        timestamps: false,
    })

module.exports = model("sellHistory", sellHistorySchema);
