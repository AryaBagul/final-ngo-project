const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ GET notifications for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
  userId: req.user.id,
})
.populate({
  path: "referenceId",
  populate: {
    path: "ngo",
    select: "name ngoDetails"
  }
})
.sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Mark as read
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const sendEmail = require("../utils/sendEmail"); // adjust path if needed

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "ngoconnectvesit@gmail.com", // put YOUR email here
      "Test Email 🚀",
      "NGOConnect email system is working!"
    );

    res.send("✅ Email sent! Check inbox");
  } catch (err) {
    res.status(500).send("❌ Error sending email");
  }
});
module.exports = router;