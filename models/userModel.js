const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { ObjectId } = mongoose.SchemaTypes;

const userSchema = mongoose.Schema({
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
            type: String,
            required: false,
        },
    }], required: false,
}, 
{
    timestamps: true,
})

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next()

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword;
    next();
})

userSchema.methods.getJWTToken = function() {
    return jwt.sign({ _id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    })
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)