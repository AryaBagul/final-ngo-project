const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["money", "items"],
            required: true,
        },

        // 💰 Money donation
        amount: {
            type: Number,
            validate: {
                validator: function () {
                    return this.type === "money" ? this.amount > 0 : true;
                },
                message: "Amount required for money donation",
            },
        },

        // 📦 Item donation
        items: {
            type: String,
            validate: {
                validator: function () {
                    return this.type === "items" ? !!this.items : true;
                },
                message: "Items required for item donation",
            },
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "online"],
            default: "cash",
        },

        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
