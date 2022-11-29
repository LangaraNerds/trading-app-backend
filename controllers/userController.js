const asyncHandler = require("express-async-handler");
const {generateFromEmail} = require("unique-username-generator");
// password encryption
const User = require("../models/userModel");


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
const {seedAssets} = require("../utils/constants");


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


        if (user) {
            await seedAssets(credential.user.uid)
        }

        const adminAuth = getAdminAuth();
        const token = await adminAuth.createCustomToken(credential.user.uid);

        res.status(201).json({
            success: true,
            token: token,
            user: user,
            // userId: credential.user.uid,
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

    }
});

/**
 * This function takes in a user_id and creates a new asset for each of the 8 assets listed in the array
 * @param user_id - The user_id of the user you want to seed assets for.
 */


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

        res.status(200).json({
            success: true,
            token: token,
            user: user,
            userId: credential.user.uid,
            fcm_token: user.fcm_token,
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

// @desc   Stop user tutorial
// @route  /api/users/tutorial
// @access Private
// @param  userId
const skipTutorial = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findOneAndUpdate({firebase_uuid: userId}, {isTutorial: false});

        res.status(201).json({
            success: true,
            user: user,
            message: `User tutorial request success for ${user.email}`,
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
    userFCMToken,
    skipTutorial
};
