const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const User = require("../models/Users");
const Event = require("../models/events");
const Donation = require("../models/Donation");

// ✅ 1. Get all NGOs
router.get("/ngos", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const ngos = await User.find({ role: "ngo" }).select("-password");
  res.json(ngos);
});

// ✅ 2. Get all events
router.get("/events", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const events = await Event.find().populate("createdBy");
  res.json(events);
});

// ✅ 3. Get all donations
router.get("/donations", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const donations = await Donation.find().populate("ngo");
  res.json(donations);
});

module.exports = router;