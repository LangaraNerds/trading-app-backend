const asyncHandler = require('express-async-handler')

const sendToken = asyncHandler(async (res, userInfo, statusCode, message) => {
    const token = userInfo.token;

    const options = {
        httpOnly: true,
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
    };

    const userData = {
        email: userInfo.email,
    };

    res.status(statusCode).cookie("token", token, options).json({ success: true, message, user: userData });
});

module.exports = {sendToken}