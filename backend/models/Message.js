const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    text: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);