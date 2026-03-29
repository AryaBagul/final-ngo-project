import React, { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import "../../styles/chat.css";

const ChatContainer = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ Toggle function
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="chat-container">

      {/* LEFT SIDEBAR (NGO LIST) */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : "closed"}`}>
        <ConversationList onSelectChat={setSelectedChat} />
      </div>

      {/* TOGGLE BUTTON */}
      <div
        className={`toggle-btn ${isSidebarOpen ? "open" : "closed"}`}
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? "←" : "→"}
      </div>

      {/* CHAT WINDOW */}
      <ChatWindow
        selectedChat={selectedChat}
        openSidebar={() => setIsSidebarOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />

    </div>
  );
};

export default ChatContainer;