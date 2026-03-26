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

// 🔥 NEW: WhatsApp-style status
status: {
  type: String,
  enum: ["sent", "delivered", "seen"],
  default: "sent",
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
