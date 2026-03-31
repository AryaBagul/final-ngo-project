const express = require("express");
const router = express.Router();
const Event = require("../models/events.js");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE EVENT
router.post("/create", authMiddleware, async (req, res) => {
  try {
    // Role restriction
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can create events" });
    }

    const event = await Event.create({
      ...req.body,
      ngo: req.user.id,
      createdBy: req.user.id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET NGO EVENTS
router.get("/my-events", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ ngo: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// UPDATE EVENT
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can update events" });
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user.id },
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// DELETE EVENT
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can delete events" });
    }

    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      ngo: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET ALL EVENTS (For Volunteers)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("ngo", "name email")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;