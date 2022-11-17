const {Schema, model,} = require("mongoose");

const limitOrderSchema = new Schema(
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
        quantity:{
          type: Number,
        },
        price: {
            type: Number,
            required: [false, 'Please add the Quantity'],
        },
        typeOrder: {
            type: String,
        },
        exec: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    })

module.exports = model("limitOrder", limitOrderSchema);
