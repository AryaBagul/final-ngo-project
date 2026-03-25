import React from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, currentUser }) => {
  return (
    <div style={{ height: "60vh", overflowY: "scroll" }}>
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          message={msg}
          isOwn={msg.sender === currentUser}
        />
      ))}
    </div>
  );
};

export default MessageList;