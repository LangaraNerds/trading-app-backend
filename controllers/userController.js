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
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Create user
        user = await User.create({
            firstName,
            lastName,
            email,
            password,
        });

        sendToken(res, user, 201, "Sign up complete");
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

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Please enter all fields" });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Email or Password" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Password" });
        }

        sendToken(res, user, 200, "Login Successful");
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc   Logout a user
// @route  /api/users/logout
// @access Public
const userLogout = asyncHandler(async (req, res) => {
    try {
        res.status(200)
            .cookie("token", null, {
                expires: new Date(Date.now()),
            })
            .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc   Get user profile
// @route  /api/users/me
// @access Private
const userProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        sendToken(res, user, 201, `Welcome back ${user.firstName} ${user.lastName}`);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {
    userSignup,
    userLogin,
    userLogout,
    userProfile
};
