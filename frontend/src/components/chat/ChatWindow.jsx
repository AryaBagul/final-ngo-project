import React, { useEffect, useState } from "react";
import socket from "../../services/socket";
import {
  getOrCreateConversation,
  getMessages,
  sendMessageAPI,
} from "../../api/chatApi";

const ChatWindow = ({ selectedChat, openSidebar }) => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [text, setText] = useState("");

  const [typingUser, setTypingUser] = useState(null); // ✅ NEW

  const userId = localStorage.getItem("userId");

  // 🔹 SETUP CHAT
  useEffect(() => {
    const setupChat = async () => {
      if (!selectedChat) return;

      try {
        const receiverId = selectedChat._id;

        const res = await getOrCreateConversation({
          senderId: userId,
          receiverId,
        });

        const convId = res.data._id;
        setConversationId(convId);

        const msgRes = await getMessages(convId);
        setMessages(msgRes.data);

        socket.emit("joinConversation", {
          sender: userId,
          receiver: receiverId,
        });

        socket.emit("markSeen", {
          conversationId: convId,
          userId,
        });
      } catch (err) {
        console.error("Chat setup error:", err);
      }
    };

    setupChat();
  }, [selectedChat, userId]);

  // 🔹 SOCKET LISTENERS
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageDelivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, status: "delivered" }
            : msg
        )
      );
    });

    socket.on("messagesSeen", () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === userId
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });

    // ✅ TYPING LISTENER
    socket.on("typing", ({ sender }) => {
      if (sender === selectedChat?._id) {
        setTypingUser(sender);

        setTimeout(() => setTypingUser(null), 2000);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageDelivered");
      socket.off("messagesSeen");
      socket.off("typing");
    };
  }, [userId, selectedChat]);

  // 🔹 SEND MESSAGE
  const handleSend = async () => {
    if (!text.trim() || !conversationId) return;

    const messageText = text;
    setText(""); // ✅ clear immediately

    const message = {
      conversationId,
      sender: userId,
      receiver: selectedChat._id,
      text: messageText,
      status: "sent",
    };

    try {
      socket.emit("sendMessage", message);
      await sendMessageAPI(message);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // 🔹 TYPING EMIT (SMART)
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit("typing", {
      sender: userId,
      receiver: selectedChat._id,
    });
  };

  // 🔹 EMPTY STATE
  if (!selectedChat) {
    return (
      <div className="chat-window">
        <div className="chat-header">Chat</div>
        <div className="message-list">
          <p style={{ textAlign: "center", marginTop: "50px" }}>
            Select an NGO to start chatting 💬
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* HEADER */}
      <div className="chat-header">
        <span className="back-btn" onClick={openSidebar}>
          ⬅
        </span>
        {selectedChat.name}
      </div>

      {/* ✅ TYPING INDICATOR */}
      {typingUser && (
        <div className="typing" style={{ paddingLeft: "10px" }}>
          Typing...
        </div>
      )}

      {/* MESSAGES */}
      <div className="message-list">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === userId ? "own" : "other"
            }`}
          >
            <span>{msg.text}</span>

            {msg.sender === userId && (
              <span className={`tick ${msg.status}`}>
                {msg.status === "sent" && "✓"}
                {msg.status === "delivered" && "✓✓"}
                {msg.status === "seen" && "✓✓"}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleTyping} // ✅ UPDATED
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;