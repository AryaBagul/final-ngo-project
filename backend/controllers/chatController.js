const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { sendConnectionEmail } = require("../utils/sendEmail");
const User = require("../models/Users");

// 👉 Create or get conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "senderId and receiverId required" });
    }

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
    console.error("❌ getOrCreateConversation:", error);
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId required" });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ getMessages:", error);
    res.status(500).json({ error: error.message });
  }
};

// 👉 Send message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, sender, receiver, text } = req.body;

    if (!conversationId || !sender || !receiver || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingMessage = await Message.findOne({ conversationId });
    const isFirstMessage = !existingMessage;

    const message = await Message.create({
      conversationId,
      sender,
      receiver,
      text,
      isRead: false,
      status: "sent",
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
    });

    const senderUser = await User.findById(sender);
    const receiverUser = await User.findById(receiver);

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (isFirstMessage) {
      await sendConnectionEmail(receiverUser.email, senderUser.name);
    }

    await Notification.create({
      userId: receiver,
      type: "message",
      message: `${senderUser.name} sent you a message`,
      isRead: false,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("❌ sendMessage:", error);
    res.status(500).json({ error: error.message });
  }
};

// 👉 Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { conversationId } = req.body;

    if (!userId || !conversationId) {
      return res.status(400).json({ error: "userId or conversationId missing" });
    }

    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        isRead: false,
      },
      {
        isRead: true,
        status: "seen",
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("❌ markMessagesAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};

// 👉 Global unread count
exports.getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    console.log("USER FROM TOKEN:", userId);

    if (!userId) {
      return res.status(400).json({ error: "User missing in token" });
    }

    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    console.log("UNREAD COUNT:", count);

    res.status(200).json({ count });

  } catch (error) {
    console.error("❌ UNREAD COUNT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 👉 Conversations list
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({ error: "User not found in token" });
    }

    const conversations = await Conversation.find({
      participants: userId,
    }).sort({ updatedAt: -1 });

    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participants.find(
          (p) => p.toString() !== userId.toString()
        );

        const otherUser = await User.findById(otherUserId).select("name");

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiver: userId,
          isRead: false,
        });

        return {
          conversationId: conv._id,
          ngo: otherUser,
          unreadCount,
          lastMessage: conv.lastMessage || "",
          lastMessageTime: conv.updatedAt,
        };
      })
    );

    res.status(200).json(formatted);
  } catch (error) {
    console.error("❌ getUserConversations:", error);
    res.status(500).json({ error: error.message });
  }
};