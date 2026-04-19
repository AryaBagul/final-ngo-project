
import React, { useEffect, useState, useRef } from "react";
import socket from "../../services/socket";
import API from "../../api/axios";
import {
  getOrCreateConversation,
  getMessages,
  sendMessageAPI,
} from "../../api/chatApi";

const ChatWindow = ({ selectedChat, refreshUnread }) => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messageListRef = useRef(null);
  const userId = localStorage.getItem("userId");

  // ✅ scroll
  const scrollToBottom = () => {
    const el = messageListRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setShowScrollBtn(false);
  };

  // ✅ scroll detection
  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distance =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distance > 80);
    };

    el.addEventListener("scroll", handleScroll);
    setTimeout(handleScroll, 100);

    return () => el.removeEventListener("scroll", handleScroll);
  }, [messages]);

  // ✅ auto scroll
  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;

    const distance =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    if (distance < 80) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // 🔥 SETUP CHAT (FIXED)
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
        console.log("CONVERSATION:", convId);

        setConversationId(convId);

        // ✅ FETCH MESSAGES FIRST
        const msgRes = await getMessages(convId);
        console.log("MESSAGES:", msgRes.data);

        const updatedMsgs = msgRes.data.map((msg) => ({
          ...msg,
          status: msg.status || "sent",
        }));

        setMessages(updatedMsgs);

        // ✅ MARK AS READ (AFTER convId exists)
        await API.put(
          "/chat/messages/read",
          { conversationId: convId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (refreshUnread) refreshUnread();

        setTimeout(scrollToBottom, 100);

        // ✅ SOCKET JOIN
        socket.emit("joinConversation", {
          sender: userId,
          receiver: receiverId,
        });

        socket.emit("markSeen", {
          conversationId: convId,
          viewerId: userId,
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
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
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

    socket.on("messagesSeen", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });

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
  }, [selectedChat]);

  // 🔹 SEND MESSAGE
  const handleSend = async () => {
    if (!text.trim() || !conversationId) return;

    const message = {
      conversationId,
      sender: userId,
      receiver: selectedChat._id,
      text,
    };

    setText("");

    try {
      socket.emit("sendMessage", message);
     
      if (refreshUnread) refreshUnread();
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

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
            Select an NGO to start chatting ......
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* HEADER */}
      <div className="chat-header">
        <span className="chat-title">
          {selectedChat.name || "Chat"}
        </span>
      </div>

      {typingUser && <div className="typing">Typing...</div>}

      {/* MESSAGES */}
      <div className="message-list" ref={messageListRef}>
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${
              msg.sender === userId ? "own" : "other"
            }`}
          >
            <div className="message-content">
              <span className="message-text">{msg.text}</span>

              <div className="message-meta">
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {msg.sender === userId && (
                  <span className={`tick ${msg.status}`}>
                    ✓✓
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SCROLL BTN */}
      {showScrollBtn && (
        <button className="scroll-to-bottom" onClick={scrollToBottom}>
          ↓
        </button>
      )}

      {/* INPUT */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;

