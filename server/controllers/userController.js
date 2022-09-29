const asyncHandler = require("express-async-handler");
// password encryption
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

// @desc   Register a new user
// @route  /api/users/signup
// @access Public
const userSignup = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    //Validation
    if (!firstName || !lastName || !email || !password) {
        res.status(400);
        throw new Error("Please include all fields");
    }

    // Check if user mail already exists
    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Password encyptions
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc   Login a new user
// @route  /api/users/login
// @access Public
const userLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    const user = await User.findOne({ email })

    // Check user and password match
    if(user && (await bcrypt.compare(password, user.password))){
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(401)
        throw new Error('Invalid username and password. Please try again.')
    }

})

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

module.exports = {
    userSignup,
    userLogin
};
