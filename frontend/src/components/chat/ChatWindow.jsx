import React, { useEffect, useState } from "react";
import socket from "../../services/socket";
import {
  getOrCreateConversation,
  getMessages,
  sendMessageAPI,
} from "../../api/chatApi";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const userId = "ngo1"; // 🔥 replace with logged-in user later

  useEffect(() => {
    const setupChat = async () => {
      if (!selectedChat) return;

      const receiverId = selectedChat._id;

      // 1️⃣ Get or create conversation
      const res = await getOrCreateConversation({
        senderId: userId,
        receiverId,
      });

      const convId = res.data._id;
      setConversationId(convId);

      // 2️⃣ Fetch old messages
      const msgRes = await getMessages(convId);
      setMessages(msgRes.data);

      // 3️⃣ Join socket room
      socket.emit("joinConversation", {
        sender: userId,
        receiver: receiverId,
      });
    };

    setupChat();
  }, [selectedChat]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const handleSend = async (text) => {
    if (!conversationId) return;

    const message = {
      conversationId,
      sender: userId,
      receiver: selectedChat._id,
      text,
    };

    // 1️⃣ Send via socket (real-time)
    socket.emit("sendMessage", message);

    // 2️⃣ Update UI instantly
    setMessages((prev) => [...prev, message]);

    // 3️⃣ Save to DB
    await sendMessageAPI(message);
  };

  if (!selectedChat) return <div>Select a chat</div>;

  return (
    <div style={{ width: "70%", padding: "10px" }}>
      <h3>{selectedChat.name}</h3>
      <MessageList messages={messages} currentUser={userId} />
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;