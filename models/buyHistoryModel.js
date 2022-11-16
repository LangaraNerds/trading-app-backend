const {Schema, model,} = require("mongoose");

const buyHistorySchema = new Schema(
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
            required: [false, 'Please add the price'],
        },
        totalPrice: {
            type: Number,
            required: [false, 'Please add the Total price'],
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

module.exports = model("buyHistory", buyHistorySchema);
