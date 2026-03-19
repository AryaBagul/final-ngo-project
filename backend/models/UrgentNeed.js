const mongoose = require("mongoose");

const urgentNeedSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    itemsNeeded: [{ type: String }],
    location: { type: String, required: true },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UrgentNeed", urgentNeedSchema);