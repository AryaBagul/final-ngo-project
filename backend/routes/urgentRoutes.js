const express = require("express");
const router = express.Router();
const UrgentNeed = require("../models/UrgentNeed");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const User = require("../models/Users");
// Create Urgent Need
router.post("/create", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can post urgent needs" });
    }

    const urgent = await UrgentNeed.create({
  ...req.body,
  ngo: req.user.id,
});

// 🔔 CREATE NOTIFICATIONS
const users = await User.find({
  role: { $in: ["donor", "volunteer"] },
});

// fetch NGO details
const ngoUser = await User.findById(req.user.id);

// create notifications with proper data
const notifications = users.map((user) => ({
  userId: user._id,
  message: `🚨 ${ngoUser.ngoDetails?.organizationName || ngoUser.name} posted a need in ${urgent.location}`,
  type: "urgent_need",
  referenceId: urgent._id,   // 👈 VERY IMPORTANT
}));

await Notification.insertMany(notifications);

res.status(201).json(urgent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get NGO urgent needs
router.get("/my-needs", authMiddleware, async (req, res) => {
  try {
    const needs = await UrgentNeed.find({ ngo: req.user.id });
    res.json(needs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const need = await UrgentNeed.findById(req.params.id)
      .populate("ngo", "name ngoDetails");

    if (!need) {
      return res.status(404).json({ message: "Urgent need not found" });
    }

    res.json(need);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;