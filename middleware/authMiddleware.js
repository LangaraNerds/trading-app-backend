const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { getAuth } = require("firebase-admin/auth");

const isAuthenticated = asyncHandler(async (req, res, next) => {
	// const uid = req.headers["uid"];

	const regex = /Bearer (.+)/i;
	try {
		const idToken = req.headers['authorization'].match(regex)?.[1];

		req.token = await getAuth().verifyIdToken(idToken);

		next();
	} catch (err) {

		res.status(401).json({ error: { code: "unauthenticated" } });
	}
});

module.exports = { isAuthenticated };