const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  location: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },

  time: String,
  skillsRequired: [String],
  volunteersNeeded: Number,

  // ✅ NGO reference (optional - you can keep or remove later)
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // ✅ THIS IS THE IMPORTANT FIX
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);