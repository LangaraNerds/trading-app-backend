const mongoose = require('mongoose')
const { ObjectId } = mongoose.SchemaTypes;

const userSchema = mongoose.Schema({
    firebase_uuid: {
        type: String,
        required: [false, 'Please add a firebase uuid'],
    },
    fullName: {
        type: String,
        required: [false, 'Please add full name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    wallet: [{
        order_id: {
            type: ObjectId,
            ref: "Orders",
            required: false,
        },
        balance: {
            type: Number,
            required: false,
            default: 1000
        },
    }], required: false,
}, 
{
    timestamps: true,
})
module.exports = mongoose.model('User', userSchema)