import React from "react";

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div
      style={{
        textAlign: isOwn ? "right" : "left",
        margin: "5px",
      }}
    >
      <span
        style={{
          background: isOwn ? "#DCF8C6" : "#eee",
          padding: "8px",
          borderRadius: "10px",
        }}
      >
        {message.text}
      </span>
    </div>
  );
};

export default MessageBubble;