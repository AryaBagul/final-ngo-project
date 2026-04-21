const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ✅ ADD THIS
    lastMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // ✅ gives updatedAt automatically
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);