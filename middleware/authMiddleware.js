const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { getAuth } = require("firebase-admin/auth");

const isAuthenticated = asyncHandler(async (req, res, next) => {
	const regex = /Bearer (.+)/i;
	try {
		const idToken = req.headers['authorization'].match(regex)?.[1];
		console.log("isAuth", idToken)
		req.token = await getAuth().verifyIdToken(idToken);

		next();
	} catch (err) {
		console.log(err)
		res.status(401).json({ error: { code: "unauthenticated" } });
	}
});

module.exports = { isAuthenticated };