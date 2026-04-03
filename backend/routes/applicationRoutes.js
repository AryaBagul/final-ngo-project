const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");

// Volunteer Apply
router.post("/apply/:eventId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "volunteer") {
      return res.status(403).json({ message: "Only volunteers can apply" });
    }

    const existing = await Application.findOne({
      event: req.params.eventId,
      volunteer: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      event: req.params.eventId,
      volunteer: req.user.id,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// NGO View Applications For Event
router.get("/event/:eventId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can view applications" });
    }

    const applications = await Application.find({
      event: req.params.eventId,
    })
      .populate("volunteer", "name email")
      .populate("event", "title");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// NGO Approve / Reject Application
router.put("/:applicationId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can update status" });
    }

    const application = await Application.findById(req.params.applicationId)
      .populate("event");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Ensure this NGO owns the event
    if (application.event.ngo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = req.body.status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Volunteer - Get My Applications
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "volunteer") {
      return res.status(403).json({ message: "Only volunteers allowed" });
    }

    const applications = await Application.find({
      volunteer: req.user.id,
    })
      .populate("event", "title date location")
      .populate("event.ngo", "name");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;