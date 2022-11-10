const asyncHandler = require("express-async-handler");
const {generateFromEmail} = require("unique-username-generator");
// password encryption
const User = require("../models/userModel");
const Asset = require("../models/assetsModel");
const {sendToken} = require("../utils/sendToken");

require("../config/firebase-config");
const {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} = require("firebase/auth");
const {getAuth: getAdminAuth} = require("firebase-admin/auth");

// firebase admin
const admin = require("firebase-admin");
const credentials = require("../config/serviceAccountKey.json");


admin.initializeApp({
    credential: admin.credential.cert(credentials),
});

/**
 @desc   Register a new user
 @route  /api/users/signup
 @access Public
 */
const userSignup = asyncHandler(async (req, res) => {
    let {email, password, location} = req.body;

    try {

        email = email.toLowerCase().trim();

        // Check if user mail already exists
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const auth = getAuth();
        const credential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        // generate username from email and add 3 random digits
        const username = generateFromEmail(email, 3);

        userData = {
            firebase_uuid: credential.user.uid,
            username,
        }

        // Create user
        user = await User.create({
            firebase_uuid: credential.user.uid,
            email: email,
            username: username,
            location: {
                type: "Point",
                coordinates: location ? [location.longitude, location.latitude] : [0, 0],
                city: location ? location.city : "",
                state: location ? location.state : "",
                country: location ? location.country : "",
            },
        })

        console.log(credential.user.uid)
        if (user) {
            await seedAssets(credential.user.uid)
        }

        const adminAuth = getAdminAuth();
        const token = await adminAuth.createCustomToken(credential.user.uid);

        res.status(201).json({
            success: true,
            token: token,
            userId: credential.user.uid,
            message: "Login success",
        });
    } catch (error) {

        switch (error.code) {
            case "auth/invalid-email":
                res.status(404).json({
                    success: false,
                    message: "Invalid email. Please try again.",
                });
                break;
            case "auth/email-already-in-use":
                res.status(401).json({
                    success: false,
                    message: "Email already in use. Please try again.",
                });
                break;
            default:
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
                break;
        }
        console.log("Signup Error", error);
    }
});

/**
 * This function takes in a user_id and creates a new asset for each of the 8 assets listed in the array
 * @param user_id - The user_id of the user you want to seed assets for.
 */
async function seedAssets(user_id) {
    try {
        await Asset.insertMany([
            {
                name: "Bitcoin",
                ticker: "BTCUSDT",
                user_id: user_id
            },
            {
                name: "Ethereum",
                ticker: "ETHUSDT",
                user_id: user_id
            },
            {
                name: "Binance Coin",
                ticker: "BNBUSDT",
                user_id: user_id
            },
            {
                name: "Ripple",
                ticker: "XRPUSDT",
                user_id: user_id
            },
            {
                name: "Cardano",
                ticker: "ADAUSDT",
                user_id: user_id
            },
            {
                name: "Solano",
                ticker: "SOLUSDT",
                user_id: user_id
            },
            {
                name: "Dogecoin",
                ticker: "DOGEUSDT",
                user_id: user_id
            },
            {
                name: "Tron",
                ticker: "TRXUSDT",
                user_id: user_id
            },

        ])
    } catch (error) {
        throw error
    }
}

// @desc   Login a new user
// @route  /api/users/login
// @access Public
const userLogin = asyncHandler(async (req, res) => {
    let {email, password} = req.body;

    try {

        email = email.toLowerCase().trim();
        const credential = await signInWithEmailAndPassword(
            getAuth(),
            email,
            password
        );
        const token = await getAdminAuth().createCustomToken(
            credential.user.uid
        );

        const user = await User.findOne({firebase_uuid: credential.user.uid});
        let fcm_token

        user.fcm_token == null ? fcm_token = 0 : fcm_token = 1;


        res.status(200).json({
            success: true,
            token: token,
            userId: credential.user.uid,
            fcm_token: fcm_token,
            message: "Login success",
        });
    } catch (error) {
        switch (error.code) {
            case "auth/user-not-found":
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                break;
            case "auth/wrong-password":
                res.status(401).json({
                    success: false,
                    message: "Wrong password",
                });
                break;
            default:
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
                break;
        }

        console.log("Login Error", error.code);
    }
});

// @desc   Logout a user
// @route  /api/users/logout
// @access Public
const userLogout = asyncHandler(async (req, res) => {
    try {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                res.status(200)
                    .cookie("token", null, {
                        expires: new Date(Date.now()),
                    })
                    .json({
                        success: true,
                        message: "Logged out successfully",
                    });
            })
            .catch((error) => {
                res.status(500).json({success: false, message: error});
            });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// @desc   Get user profile
// @route  /api/users/me
// @access Private
const userProfile = asyncHandler(async (req, res) => {
    try {
        // const userId = req.params.id;
        const fbuuid = req.token.uid;

        const user = await User.findOne({firebase_uuid: fbuuid}).exec();
        // if (userId !== req.token.uid) {
        //     res.status(403).json({ success: false, error: { code: 'unauthorized' } });
        // }
        // console.log("success", req);
        // const user = await User.findById(req.params.id)

        res.status(201).json({
            success: true,
            user: user,
            message: `User info request success for ${user.email}`,
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});
/**
 * @desc update user with fcm_token
 * @route /user/token
 * @param userId
 * @param token
 * */
const userFCMToken = asyncHandler(async ({body}, res) => {
    const {userId, token} = body
    try {
        const user = await User.findOne({firebase_uuid: userId});
        const hasToken = user.fcm_token;
        if (!hasToken) {
            await User.updateOne({_id: user.id}, {
                $set: {
                    "fcm_token": token,
                }
            })
            res.status(200).json({
                success: true,
                message: `token successfully save `,
            });
        } else {
            res.status(401).json({
                success: true,
                message: `user already has a token`,
            });
        }

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});
module.exports = {
    userSignup,
    userLogin,
    userLogout,
    userProfile,
    userFCMToken
};
