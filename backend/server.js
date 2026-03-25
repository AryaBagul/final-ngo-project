const express = require("express");
const cors = require("cors");
require("dotenv").config();

const http = require("http");                 
const { Server } = require("socket.io");    

const donationRoutes = require("./routes/donationRoutes");
const connectDB = require("./config/db");

const app = express();

// 🔥 Create HTTP server (IMPORTANT for socket.io)
const server = http.createServer(app);

// 🔥 Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend URL
    methods: ["GET", "POST"],
  },
});

// 🔥 Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join conversation room
  socket.on("joinConversation", ({ sender, receiver }) => {
    const roomId = [sender, receiver].sort().join("_");
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Send message
  socket.on("sendMessage", async (data) => {
  const { sender, receiver } = data;
  const roomId = [sender, receiver].sort().join("_");

  io.to(roomId).emit("receiveMessage", data);
});

  // Disconnect
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

// 🔥 IMPORTANT: use server.listen instead of app.listen
server.listen(5000, () => {
  console.log("Server running on port 5000");
});

// Global Error Handler
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