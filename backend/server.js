const express = require("express");
const cors = require("cors");
require("dotenv").config();


const donationRoutes = require("./routes/donationRoutes");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/urgent", require("./routes/urgentRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/donations", donationRoutes);
app.get("/", (req, res) => {
  res.send("NGOConnect Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

// Global Error Handler for better debugging
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});