const {Schema, model} = require('mongoose')

const assetsSchema = new Schema({
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
            default: 0,
        },
        ticker: {
            type: String,
            required: [false, 'Please add an Ticker'],
        },
    },
    {
        timestamps: true,
    })


module.exports = model('Assets', assetsSchema)