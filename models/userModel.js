const mongoose = require("mongoose");
const { ObjectId } = mongoose.SchemaTypes;

const walletSchema = mongoose.Schema({
	name: {
		type: String,
		required: false,
	},
	ticker: {
		type: String,
		required: false,
	},
	balance: {
		type: Number,
		required: false,
	},
	availableBalance: {
		type: Number,
		required: false,
	},
    updatedAt: {
        type: Date,
        required: false,
        default: Date.now
    },
});
const Wallet = mongoose.model("Wallet", walletSchema);

const userSchema = mongoose.Schema(
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
		email: {
			type: String,
			required: [true, "Please add an email"],
			unique: true,
		},
		wallet: {
			type: mongoose.ObjectId,
			ref: "Wallet",
		},
		required: false,
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
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("User", userSchema);
