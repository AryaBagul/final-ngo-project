import axios from "./axios";

// create/get conversation
export const getOrCreateConversation = (data) =>
  axios.post("/chat/conversation", data);

// get messages
export const getMessages = (conversationId) =>
  axios.get(`/chat/messages/${conversationId}`);

// save message
export const sendMessageAPI = (data) =>
  axios.post("/chat/message", data);