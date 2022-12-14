const asyncHandler = require("express-async-handler");
const {Expo} = require('expo-server-sdk');
const User = require("../models/userModel");
const PriceAlert = require("../models/priceAlertModel");
const LimitOrder = require("../models/limitOrderModel");


exports.pushNotification = asyncHandler(async (usersId, coinPrice,
                                               fetchPrice, notificationType, coinName,
                                               coinTicker, coinQuantity = 0) => {
    // const user = await User.find({firebase_uuid: userId}, {fcm_token: 1});
    // const token = user.fcm_token

    // Create a new Expo SDK client
    // optionally providing an access token if you have enabled push security
    let expo = new Expo();
    //ExponentPushToken[ULYivqCKoSg1JqYVNjr_yb]
    let userTokens = [];

    // for (const userId in usersId) {
    //     let userToken = await User.find({firebase_uuid: userId}, {fcm_token: 1})
    //     userTokens.push(userToken.fcm_token)
    // }

    for (const user of usersId) {
        const userToken = await User.findOne({firebase_uuid: user})

        userTokens.push(userToken.fcm_token)
    }

    // Create the messages that you want to send to clients
    let messages = [];
    for (let pushToken of userTokens) {
        // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

        const user = await User.findOne({fcm_token: pushToken}, {fcm_token: 1});

        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }
        let message = ``
        switch (notificationType) {
            case notificationType = 'alert':
                message = `The price of ${coinName} is at ${coinPrice}`
                break;
            case notificationType = 'buy':
                message = `You just bought ${coinName} at the price of ${coinPrice} `
                break;
            case notificationType = 'sell':
                message = `You just sold ${coinName} at the price of ${coinPrice} `
                break;
        }

        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
            to: pushToken,
            sound: 'default',
            title: `${coinName}`,
            body: message,
            data: {
                price: coinPrice,
                coinName: coinName,
                ticker: coinTicker,
                user: user.name
            },
        })
        const date = new Date();
        if (notificationType === 'alert') {

            await PriceAlert.updateMany({price: fetchPrice, ticker: coinTicker, notified: 0}, {
                $set: {
                    notified: 1,
                    updatedAt: date
                }
            })
        }
        if (notificationType === 'buy' || notificationType === 'sell') {

            await LimitOrder.updateMany({
                price: fetchPrice, ticker: coinTicker,
                typeOrder: notificationType, status: 0
            }, {
                $set: {
                    status: 1,
                    updatedAt: date
                }
            })
        }

    }

// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    await (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors

            } catch (error) {
                console.error(error);
            }
        }

    })();

// Later, after the Expo push notification service has delivered the
// notifications to Apple or Google (usually quickly, but allow the service
// up to 30 minutes when under load), a "receipt" for each notification is
// created. The receipts will be available for at least a day; stale receipts
// are deleted.
//
// The ID of each receipt is sent back in the response "ticket" for each
// notification. In summary, sending a notification produces a ticket, which
// contains a receipt ID you later use to get the receipt.
//
// The receipts may contain error codes to which you must respond. In
// particular, Apple or Google may block apps that continue to send
// notifications to devices that have blocked notifications or have uninstalled
// your app. Expo does not control this policy and sends back the feedback from
// Apple and Google, so you can handle it appropriately.
    let receiptIds = [];
    for (let ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    await (async () => {
        // Like sending notifications, there are different strategies you could use
        // to retrieve batches of receipts from the Expo service.
        for (let chunk of receiptIdChunks) {
            try {
                let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                console.log(receipts);

                // The receipts specify whether Apple or Google successfully received the
                // notification and information about an error, if one occurred.
                for (let receiptId in receipts) {
                    let {status, message, details} = receipts[receiptId];
                    if (status === 'error') {
                        console.error(
                            `There was an error sending a notification: ${message}`
                        );
                        if (details && details.error) {
                            // The error codes are listed in the Expo documentation:
                            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                            // You must handle the errors appropriately.
                            console.error(`The error code is ${details.error}`);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    })();

});

