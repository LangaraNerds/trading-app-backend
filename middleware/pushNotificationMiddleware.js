import {getMessaging} from "firebase-admin/messaging";
import asyncHandler from "express-async-handler";
const User = require("../models/userModel");


// This registration token comes from the client FCM SDKs.
exports.pushNotification = asyncHandler(async(userId, price, coinName, coinTicker) =>{

    const user = await User.find({firebase_uuid: userId}, {fcm_token: 1});
    const token = user.fcm_token

    const message = {
        data: {
            price: price,
            coinName: coinName,
            ticker: coinTicker,
        },
        token: token
    };

// Send a message to the device corresponding to the provided
// registration token.
    getMessaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
});
