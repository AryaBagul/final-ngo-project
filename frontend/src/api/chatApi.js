import API from "./axios";

// create/get conversation
export const getOrCreateConversation = (data) =>
  API.post("/chat/conversation", data);

// get messages
export const getMessages = (conversationId) =>
  API.get(`/chat/messages/${conversationId}`);

// send message
export const sendMessageAPI = (data) =>
  API.post("/chat/send", data);

// ✅ NEW: mark messages as seen
export const markMessagesSeen = (conversationId, userId) =>
  API.put("/chat/seen", { conversationId, userId });
