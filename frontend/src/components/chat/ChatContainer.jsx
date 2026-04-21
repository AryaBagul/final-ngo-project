import React, { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import "../../styles/chat.css";

const ChatContainer = ({ refreshUnread }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // ✅ Handle chat selection
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setIsSidebarOpen(false); // Close sidebar on chat selection
  };

  // ✅ Toggle function
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="chat-container">

      {/* LEFT SIDEBAR (NGO LIST) */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : "closed"}`}>
        <ConversationList
  onSelectChat={handleSelectChat}
  refreshUnread={refreshUnread}
/>
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
        refreshUnread={refreshUnread}
          
      />

    </div>
  );
};

export default ChatContainer;