const {Schema, model,} = require("mongoose");

const userSchema = new Schema(
    {
        firebase_uuid: {
            type: String,
            required: [false, "Please add a firebase uuid"],
            unique: true,
            trim: true,
            maxlength: [50, "Firebase uuid cannot be more than 50 characters"],
        },
        username: {
            type: String,
            required: [false, "Please add a username"],
            unique: true,
            trim: true,
        },
        firstName: {
            type: String,
            required: [false, "Please add a first name"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [false, "Please add a last name"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
        },
        fcm_token: {
            type: String,
            required: [false, "Please add an fcm_token"],
            unique: true,
        },
        picture:{
            type: String,
            default: "https://firebasestorage.googleapis.com/v0/b/trade-up-bc1be.appspot.com/o/user_placeholder.jpg?alt=media&token=f4a15f20-ca35-449f-bf12-394e246d8be2"
        },
        wallet: {
            name: {
                type: String,
                required: false,
                default: "Tether"
            },
            ticker: {
                type: String,
                required: false,
                default: "USDT"
            },
            balance: {
                type: Number,
                required: false,
                default: 1000,
            },
            orderBalance: {
                type: Number,
                required: false,
                default: 0,
            },
            updatedAt: {
                type: Date,
                required: false,
                default: Date.now
            },
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: false,
            },
            coordinates: {
                type: [Number],
                index: "2dsphere",
            },
            city: String,
            state: String,
            country: String,
        },
        required: false,
        isTutorial: {
            type: Boolean,
            required: [false, "Please add a tutorial status"],
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = model("User", userSchema);
