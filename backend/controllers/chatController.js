const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// 👉 Create or get conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get messages of a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Send message (save to DB)
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, sender, receiver, text } = req.body;

    const message = await Message.create({
      conversationId,
      sender,
      receiver,
      text,
    });

    // update last message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};