const express = require("express");
const router = express.Router();
const UrgentNeed = require("../models/UrgentNeed");
const authMiddleware = require("../middleware/authMiddleware");

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

module.exports = router;