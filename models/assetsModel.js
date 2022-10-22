const mongoose = require('mongoose')
const { ObjectId } = mongoose.SchemaTypes;

const userSchema = mongoose.Schema({
        name: {
            type: String,
            required: [false, 'Please add a Name'],
        },
        user_id: ObjectId,
        quantity: {
            type: Number,
            required: [false, 'Please add the Quantity'],
            default: 0,
        },
        ticker: {
            type: String,
            required: [true, 'Please add an Ticker'],
            unique: true
        },
    },
    {
        timestamps: true,
    })
module.exports = mongoose.model('Assets', userSchema)