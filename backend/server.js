const express = require("express");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const donationRoutes = require("./routes/donationRoutes");
const connectDB = require("./config/db");
const Message = require("./models/Message"); // 🔥 NEW

const app = express();

// 🔥 Create HTTP server
const server = http.createServer(app);

// 🔥 Initialize Socket.IO
const io = new Server(server, {
cors: {
origin: "*",
methods: ["GET", "POST"],
},
});

// 🔥 SOCKET LOGIC
io.on("connection", (socket) => {
console.log("User connected:", socket.id);

// JOIN ROOM
socket.on("joinConversation", ({ sender, receiver }) => {
const roomId = [sender, receiver].sort().join("_");
socket.join(roomId);
console.log(`User joined room: ${roomId}`);
});

// 🔥 SEND MESSAGE (FULL LOGIC)
socket.on("sendMessage", async (data) => {
try {
const { sender, receiver, conversationId, text } = data;


  const roomId = [sender, receiver].sort().join("_");

  // 1️⃣ Save message (status = sent)
  const newMessage = await Message.create({
    conversationId,
    sender,
    receiver,
    text,
    status: "sent",
  });

  // 2️⃣ Emit message to both users
  io.to(roomId).emit("receiveMessage", newMessage);

  // 3️⃣ Mark as delivered
  await Message.findByIdAndUpdate(newMessage._id, {
    status: "delivered",
  });

  // 4️⃣ Notify frontend to update ticks
  io.to(roomId).emit("messageDelivered", {
    messageId: newMessage._id,
  });

} catch (err) {
  console.error("sendMessage error:", err);
}


});

// 🔥 MARK AS SEEN
socket.on("markSeen", async ({ conversationId, userId }) => {
try {
await Message.updateMany(
{
conversationId,
receiver: userId,
status: { $ne: "seen" },
},
{ status: "seen" }
);


  // notify users in room
  socket.broadcast.emit("messagesSeen", {
    conversationId,
  });

} catch (err) {
  console.error("markSeen error:", err);
}


});

// DISCONNECT
socket.on("disconnect", () => {
console.log("User disconnected:", socket.id);
});
});

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/urgent", require("./routes/urgentRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/donations", donationRoutes);
app.use("/api/chat", require("./routes/chatRoutes"));

app.get("/", (req, res) => {
res.send("NGOConnect Backend Running");
});

// START SERVER
server.listen(5000, () => {
console.log("Server running on port 5000");
});

// ERROR HANDLING
process.on("uncaughtException", (err) => {
console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
console.error(err.name, err.message, err.stack);
process.exit(1);
});

process.on("unhandledRejection", (err) => {
console.error("UNHANDLED REJECTION! 💥 Shutting down...");
console.error(err.name, err.message, err.stack);
process.exit(1);
});
