import React from "react";

const ConversationList = ({ onSelectChat }) => {
  // dummy NGOs for now
  const ngos = [
    { _id: "1", name: "NGO A" },
    { _id: "2", name: "NGO B" },
  ];

  return (
    <div style={{ width: "30%", borderRight: "1px solid gray" }}>
      {ngos.map((ngo) => (
        <div
          key={ngo._id}
          onClick={() => onSelectChat(ngo)}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          {ngo.name}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;