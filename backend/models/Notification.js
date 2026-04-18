const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referenceId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "UrgentNeed"
},
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["urgent_need", "donation"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);