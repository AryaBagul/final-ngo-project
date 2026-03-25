import React, { useState } from "react";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div style={{ display: "flex" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1 }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatInput;