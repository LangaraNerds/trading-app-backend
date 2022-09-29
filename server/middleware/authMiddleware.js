const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const isAuthenticated = asyncHandler(async (req, res, next) => {
    try {
        const {token} = req.cookies

        if(!token) {
            return res.status(401).json({success: false, message: "Login First"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decoded._id)

        next();
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})

module.exports = {isAuthenticated}