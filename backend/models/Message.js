const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
{
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  // 🔥 WhatsApp-style status (already present)
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent",
  },

  // ✅ ADD THIS (for unread count)
  isRead: {
    type: Boolean,
    default: false,
  },

  // optional features
  isPinned: {
    type: Boolean,
    default: false,
  },

},
{ timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);