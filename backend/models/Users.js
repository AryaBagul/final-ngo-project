const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["ngo", "volunteer", "donor", "admin"],
      required: true,
    },

    contactNumber: {
      type: String,
    },

    birthdate: {
      type: Date,
    },

    address: {
      type: String,
    },

    // 🟢 NGO-specific fields (ONLY if role = ngo)
    ngoDetails: {
      organizationName: String,
      description: String,
      location: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);