const asyncHandler = require("express-async-handler");
// password encryption
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var mongoose = require('mongoose');

const User = require("../models/userModel");
const { sendToken } = require("../utils/sendToken");

require("../config/firebase-config");
const { getAuth: getClientAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require("firebase/auth");
const {
    getAuth: getAdminAuth,
  } = require('firebase-admin/auth');

// firebase admin
const admin = require("firebase-admin");
const credentials = require("../config/firebase-admin.json");

admin.initializeApp({
    credential: admin.credential.cert(credentials),
});

// @desc   Register a new user
// @route  /api/users/signup
// @access Public
const userSignup = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {

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
            email: req.body.email,
        });

        // Use mongoDB id as firebase uid
        // const auth = getAuth();
        const adminAuth = getAdminAuth();
        // let userCred
        const response = await admin.auth().createUser({
            uid: user._id.toString(),
            email: email,
            password: password,
            emailVerified: false,
            disabled: false,
        })


        const token = await adminAuth.createCustomToken(
            response.uid
        );

        res.status(201).json({ message: `Signup Success ${token}` });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
        console.log("Signup Error", error)
    }
});

// @desc   Login a new user
// @route  /api/users/login
// @access Public
const userLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    try {

        const credential = await signInWithEmailAndPassword(
            getClientAuth(),
            email,
            password
          );
          const token = await getAdminAuth().createCustomToken(
            credential.user.uid
          );
          res.status(200).json({ success: true, message: `Login Success ${token}` });

    } catch (error) {
        res.status(500).json({ success: false, message: error });
        console.log("Login Error", error);
    }

});

// @desc   Logout a user
// @route  /api/users/logout
// @access Public
const userLogout = asyncHandler(async (req, res) => {
    try {

        const auth = getAuth();
        signOut(auth).then(() => { 
            res.status(200)
            .cookie("token", null, {
                expires: new Date(Date.now()),
            })
            .json({ success: true, message: "Logged out successfully" });
        }).catch((error) => {
            res.status(500).json({ success: false, message: error });
        });


    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc   Get user profile
// @route  /api/users/me
// @access Private
const userProfile = asyncHandler(async (req, res) => {
    try {
        // const user = await User.findById(req.params.id)
        const userId = req.params.id;
        if (userId !== req.token.uid) {
            res.status(403).json({ success: false, error: { code: 'unauthorized' } });
        }

        res.status(201).json({ success: true, message: `User info request success for ${userId}` });
        // sendToken(res, user, 201, `Welcome back ${user.email}`);
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
