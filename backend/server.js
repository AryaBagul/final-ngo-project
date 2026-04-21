const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const donationRoutes = require("./routes/donationRoutes");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation"); // ✅ ADDED
const adminRoutes = require("./routes/adminRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🔥 SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔹 JOIN ROOM
  socket.on("joinConversation", ({ sender, receiver }) => {
    const roomId = [sender, receiver].sort().join("_");

    socket.join(roomId);
    socket.join(sender); // personal room

    console.log(`User joined room: ${roomId}`);
  });

  // 🔹 SEND MESSAGE
  socket.on("sendMessage", async (data) => {
    try {
      const { sender, receiver, conversationId, text } = data;

      const roomId = [sender, receiver].sort().join("_");

      // 1️⃣ Save message
      const newMessage = await Message.create({
        conversationId,
        sender,
        receiver,
        text,
        status: "sent",
      });

      // ✅ 2️⃣ UPDATE CONVERSATION (FIXED)
      const updatedConv = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: text,
          updatedAt: new Date(),
        },
        { new: true }
      );

      console.log("UPDATED CONVERSATION:", updatedConv);

      // 3️⃣ Send to both users
      io.to(roomId).emit("receiveMessage", newMessage);

      // 4️⃣ Mark delivered
      await Message.findByIdAndUpdate(newMessage._id, {
        status: "delivered",
      });

      // 5️⃣ Notify sender only
      io.to(sender).emit("messageDelivered", {
        messageId: newMessage._id,
      });

    } catch (err) {
      console.error("sendMessage error:", err);
    }
  });

  // 🔹 MARK AS SEEN
  socket.on("markSeen", async ({ conversationId, viewerId }) => {
    try {
      const messages = await Message.find({
        conversationId,
        receiver: viewerId,
        status: { $ne: "seen" },
      });

      await Message.updateMany(
        {
          conversationId,
          receiver: viewerId,
          status: { $ne: "seen" },
        },
        { status: "seen" }
      );

      messages.forEach((msg) => {
        io.to(msg.sender).emit("messagesSeen", {
          messageId: msg._id,
        });
      });

    } catch (err) {
      console.error("markSeen error:", err);
    }
  });

  // 🔹 TYPING
  socket.on("typing", ({ sender, receiver }) => {
    io.to(receiver).emit("typing", { sender });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🔹 CONNECT DB
connectDB();

app.use(cors());
app.use(express.json());

// 🔹 ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/urgent", require("./routes/urgentRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/donations", donationRoutes);
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/admin", adminRoutes);
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("NGOConnect Backend Running");
});

// 🔹 START SERVER
server.listen(5000, () => {
  console.log("Server running on port 5000");
});

// 🔹 ERROR HANDLING
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