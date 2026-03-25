import React, { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

const ChatContainer = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div style={{ display: "flex", height: "80vh" }}>
      <ConversationList onSelectChat={setSelectedChat} />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
};

export default ChatContainer;