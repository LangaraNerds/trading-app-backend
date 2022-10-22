const asyncHandler = require("express-async-handler");
// password encryption
const User = require("../models/userModel");
const Asset = require("../models/assetsModel")
const {sendToken} = require("../utils/sendToken");

require("../config/firebase-config");
const {
    getAuth,
    getAuth: getClientAuth,
    getAuth: currentUser,
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

// @desc   Register a new user
// @route  /api/users/signup
// @access Public
const userSignup = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    try {
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

		// Create user
		user = await User.create({
			firebase_uuid: credential.user.uid,
			email: email,
		});

        if (userCreated) {
            await seedAssets(userCreated._id)
        }

        const adminAuth = getAdminAuth();
        const token = await adminAuth.createCustomToken(credential.user.uid);

        res.status(201).json({
            success: true,
            token: token,
            message: "Login success",
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
        console.log("Signup Error", error);
    }
});

/**
 * This function takes in a user_id and creates a new asset for each of the 8 assets listed in the array
 * @param user_id - The user_id of the user you want to seed assets for.
 */
async function seedAssets(user_id) {
    try {
        await Asset.insertMany([{
            name: "Bitcoin",
            ticker: "BTCUSDT",
            quantity: 0,
            user_id: user_id
        }, {
            name: "Ethereum",
            ticker: "ETHUSDT",
            quantity: 0,
            user_id: user_id
        }, {
            name: " Binance Coin",
            ticker: "BNBUSDT",
            quantity: 0,
            user_id: user_id
        }, {
            name: "Ripple",
            ticker: "XRPUSDT",
            quantity: 0,
            user_id: user_id
        }, {
            name: "Cardano",
            ticker: "ADAUSDT",
            quantity: 0,
            user_id: user_id
        }, {
            name: "SOLUSDT",
            ticker: "Solano",
            quantity: 0,
            user_id: user_id
        }, {
            name: "DOGEUSDT",
            ticker: "Dogecoin",
            quantity: 0,
            user_id: user_id
        }, {
            name: "TRXUSDT",
            ticker: "Tron",
            quantity: 0,
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
    const {email, password} = req.body;

    try {
        const credential = await signInWithEmailAndPassword(
            getClientAuth(),
            email,
            password
        );
        const token = await getAdminAuth().createCustomToken(
            credential.user.uid
        );
        const userId = credential.user.uid;
        const user = await User.findOne({firebase_uuid: userId})


        res.status(200).json({
            success: true,
            token: token,
            user: user,
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
        const fbuid = req.token.uid;

        const user = await User.findOne({firebase_uuid: fbuid}).exec();
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

module.exports = {
    userSignup,
    userLogin,
    userLogout,
    userProfile,
};
