import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "../../styles/chat.css";
const ConversationList = ({ onSelectChat, unreadCounts = {} }) => {
  const [ngos, setNgos] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);

  const userId = localStorage.getItem("userId"); // ✅ GET LOGGED-IN USER

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const res = await API.get("/auth/all-ngos");
        setNgos(res.data);
      } catch (err) {
        console.error("Error fetching NGOs:", err);
      }
    };

    fetchNgos();
  }, []);

  return (
    <div className="conversation-list">
      <h3 className="chat-title">NGOs</h3>

      {ngos
        .filter((ngo) => ngo._id !== userId) // ✅ REMOVE YOURSELF
        .map((ngo) => (
          <div key={ngo._id} className="conversation-item">

            {/* LEFT SIDE → CHAT CLICK */}
            <div
              style={{ display: "flex", alignItems: "center", flex: 1, cursor: "pointer" }}
              onClick={() => onSelectChat(ngo)}
            >
              {/* Avatar */}
              <div className="avatar">
                {ngo.name?.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="conversation-info">
                <div className="ngo-name">{ngo.name}</div>
              </div>
            </div>

            {/* 🔴 UNREAD COUNT */}
            {unreadCounts[ngo._id] > 0 && (
              <div className="unread-badge">
                {unreadCounts[ngo._id]}
              </div>
            )}

            {/* 🔥 EXPLORE BUTTON */}
            <button
              className="explore-btn"
              onClick={() => setSelectedNgo(ngo)}
            >
              Explore NGO
            </button>
          </div>
        ))}

      {/* 🔥 NGO DETAILS MODAL */}
      {selectedNgo && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">{selectedNgo.ngoDetails.organizationName}</h2>

            <p className="modal-location">
              📍 {selectedNgo.ngoDetails?.location || "Not specified"}
            </p>

            <p className="modal-description">
              {selectedNgo.ngoDetails?.description ||
                "No description available"}
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