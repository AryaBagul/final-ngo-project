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
router.post("/send", async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;