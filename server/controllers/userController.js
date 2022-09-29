const asyncHandler = require("express-async-handler");
// password encryption
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const { sendToken } = require("../utils/sendToken");

// @desc   Register a new user
// @route  /api/users/signup
// @access Public
const userSignup = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user mail already exists
        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
        });

        sendToken(res, user, 201, "Please verift your account");
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc   Login a new user
// @route  /api/users/login
// @access Public
const userLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if(!user){
            return res
                .status(400)
                .json({success: false, message: "Invalid Email or Password"})
        }

        const isMatch = await user.ComparePassword(password)

        if(!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Password"})
        }

        sendToken(
            res,
            user,
            200,
            "Login Successful"
        )

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {
    userSignup,
    userLogin,
};
