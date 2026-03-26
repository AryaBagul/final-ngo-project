import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const ConversationList = ({ onSelectChat, unreadCounts = {} }) => {
  const [ngos, setNgos] = useState([]);

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

      {ngos.map((ngo) => (
        <div
          key={ngo._id}
          className="conversation-item"
          onClick={() => onSelectChat(ngo)}
        >
          {/* Avatar */}
          <div className="avatar">
            {ngo.name?.slice(0, 2).toUpperCase()}
          </div>

          {/* Info */}
          <div className="conversation-info">
            <div className="ngo-name">{ngo.name}</div>

            {/* ✅ FIXED LOCATION */}
            <div className="ngo-location">
              📍 {ngo.ngoDetails?.location || "Unknown"}
            </div>
          </div>

          {/* 🔴 UNREAD COUNT (optional feature) */}
          {unreadCounts[ngo._id] > 0 && (
            <div className="unread-badge">
              {unreadCounts[ngo._id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;