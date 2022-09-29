const asyncHandler = require('express-async-handler')

const sendToken = asyncHandler(async (res, user, statusCode, message) => {
    const token = user.getJWTToken();

    const options = {
        httpOnly: true,
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
    };

    const userData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    };

    res.statusCode(statusCode)
        .cookie("token", token, options)
        .json({ success: true, message, user: userData });
});

module.exports = {sendToken}