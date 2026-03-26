import React, { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import "../../styles/chat.css";

const ChatContainer = () => {
const [selectedChat, setSelectedChat] = useState(null);
const [isSidebarOpen, setIsSidebarOpen] = useState(true);

return ( <div className="chat-container">


  {/* LEFT SIDEBAR (NGO LIST) */}
  <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : "closed"}`}>
    <ConversationList onSelectChat={setSelectedChat} />
  </div>

  {/* TOGGLE BUTTON */}
  <div
    className="toggle-btn"
    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    title="Toggle NGO list"
  >
    {isSidebarOpen ? "⬅" : "➡"}
  </div>

  {/* CHAT WINDOW */}
  <ChatWindow
    selectedChat={selectedChat}
    openSidebar={() => setIsSidebarOpen(true)} // 🔥 for mobile back button
  />

</div>


);
};

export default ChatContainer;
