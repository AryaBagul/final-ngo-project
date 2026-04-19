const express = require("express");
const router = express.Router();

const Message = require("../models/Message");

const {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUserConversations
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

// 👉 Create or get conversation
router.post("/conversation", getOrCreateConversation);

// 👉 ✅ IMPORTANT: Put this BEFORE :conversationId
router.get("/messages/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    console.log("USER FROM TOKEN:", userId);

    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    console.log("UNREAD COUNT:", count);

    res.status(200).json({ count });

  } catch (err) {
    console.error("❌ UNREAD COUNT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 👉 OPTIONAL old route
router.get("/messages/unread", authMiddleware, getUnreadMessageCount);

// 👉 NOW safe to use dynamic route
router.get("/messages/:conversationId", getMessages);

// 👉 Send message
router.post("/message", sendMessage);

// 👉 Get conversations
router.get("/conversations", authMiddleware, getUserConversations);

// 👉 Mark messages as read
router.put("/messages/read", authMiddleware, markMessagesAsRead);

module.exports = router;