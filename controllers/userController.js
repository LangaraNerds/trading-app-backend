const asyncHandler = require("express-async-handler");
// password encryption
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const {
	generateFromEmail,
	generateUsername,
} = require("unique-username-generator");
const User = require("../models/userModel");
// const { sendToken } = require("../utils/sendToken");

require("../config/firebase-config");
const {
	getAuth,
	getAuth: getClientAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} = require("firebase/auth");
const { getAuth: getAdminAuth } = require("firebase-admin/auth");

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
	const { email, password, location } = req.body;

	try {
		// Check if user mail already exists
		let user = await User.findOne({ email });

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

		// Create user
		user = await User.create({
			firebase_uuid: credential.user.uid,
			email: email,
			username: username,
			location: {
				type: "Point",
				coordinates: [location.longitude, location.latitude],
				city: location.city,
				state: location.state,
				country: location.country,
			},
		});

		const adminAuth = getAdminAuth();
		const token = await adminAuth.createCustomToken(credential.user.uid);

		res.status(201).json({
			success: true,
			token: token,
			message: "Login success",
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
		console.log("Signup Error", error);
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

		res.status(200).json({
			success: true,
			token: token,
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
		// const userId = req.params.id;
		const fbuid = req.token.uid;

		const user = await User.findOne({ firebase_uuid: fbuid }).exec();
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
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = {
	userSignup,
	userLogin,
	userLogout,
	userProfile,
};
