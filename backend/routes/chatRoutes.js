const express = require("express");
const router = express.Router();

const {
  getOrCreateConversation,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");

// routes
router.post("/conversation", getOrCreateConversation);
router.get("/messages/:conversationId", getMessages);
router.post("/message", sendMessage);

module.exports = router;