import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "../../styles/chat.css";

const ConversationList = ({ onSelectChat, refreshUnread }) => {
  const [ngos, setNgos] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);

  const userId = localStorage.getItem("userId");

useEffect(() => {
  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [convRes, ngosRes] = await Promise.all([
        API.get("/chat/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/auth/all-ngos"),
      ]);

      const conversations = convRes.data;
      const allNgos = ngosRes.data;

      const filteredNgos = allNgos.filter(
        (ngo) => ngo._id !== userId
      );

      const enrichedConversations = conversations
        .map((conv) => {
          const ngoId =
            typeof conv.ngo === "object"
              ? conv.ngo?._id
              : conv.ngo;

          if (!ngoId) return null;

          const fullNgo = allNgos.find(
            (ngo) => ngo._id.toString() === ngoId.toString()
          );

          return {
            ...conv,
            ngo: fullNgo || conv.ngo,
          };
        })
        .filter(Boolean);

      const chatNgoIds = enrichedConversations
        .filter((c) => c.ngo && c.ngo._id)
        .map((c) => c.ngo._id.toString());

      const remainingNgos = filteredNgos.filter(
        (ngo) => !chatNgoIds.includes(ngo._id.toString())
      );

      const formattedRemaining = remainingNgos.map((ngo) => ({
        conversationId: null,
        ngo,
        unreadCount: 0,
        lastMessage: "",
        lastMessageTime: null,
      }));

      setNgos([...enrichedConversations, ...formattedRemaining]);

    } catch (err) {
      console.error("Error loading chats", err);
    }
  };

  // 🔥 INITIAL LOAD
  loadData();

  // 🔥 AUTO REFRESH EVERY 2 SEC
  const interval = setInterval(() => {
    loadData();
  }, 2000);

  return () => clearInterval(interval);

}, []);
  return (
    <div className="conversation-list">
      <h3 className="chat-title">NGOs</h3>

      {ngos.map((chat) => {
        if (!chat.ngo) return null; // 🔥 safety

        return (
          <div
            key={chat.conversationId || chat.ngo?._id}
            className="conversation-item"
          >
            {/* LEFT SIDE */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                cursor: "pointer",
              }}
              onClick={() => {
                onSelectChat(chat.ngo);

                // reset unread locally
                setNgos((prev) =>
                  prev.map((c) =>
                    c.ngo?._id === chat.ngo._id
                      ? { ...c, unreadCount: 0 }
                      : c
                  )
                );

                if (refreshUnread) refreshUnread();
              }}
            >
              {/* Avatar */}
              <div className="avatar">
                {chat.ngo?.name?.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="conversation-info">
                <div className="ngo-name">
                  {chat.ngo?.name || "Unknown NGO"}
                </div>

                <div style={{ fontSize: "12px", color: "gray" }}>
  {chat.lastMessage
    ? chat.lastMessage.length > 25
      ? chat.lastMessage.slice(0, 25) + "..."
      : chat.lastMessage
    : "Start a conversation"}
</div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
              }}
            >
              {/* TIME */}
              {chat.lastMessageTime && (
                <div style={{ fontSize: "10px", color: "gray" }}>
                  {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}

              {/* UNREAD BADGE */}
              {chat.unreadCount > 0 && (
                <div className="unread-badge">
                  {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                </div>
              )}
            </div>

            {/* EXPLORE BUTTON */}
            <button
              className="explore-btn"
              onClick={() => setSelectedNgo(chat.ngo)}
            >
              Explore NGO
            </button>
          </div>
        );
      })}

      {/* MODAL */}
      {selectedNgo && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h2 className="modal-title">
              {selectedNgo?.ngoDetails?.organizationName || selectedNgo?.name}
            </h2>

            <p className="modal-location">
              📍 {selectedNgo?.ngoDetails?.location ?? "Not specified"}
            </p>

            <p className="modal-description">
              {selectedNgo?.ngoDetails?.description ?? "No description available"}
            </p>

            <div className="modal-buttons">
              <button
                className="btn-primary"
                onClick={() => {
                  onSelectChat(selectedNgo);
                  setSelectedNgo(null);
                }}
              >
                💬 Start Chat
              </button>

              <button
                className="btn-secondary"
                onClick={() => setSelectedNgo(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;