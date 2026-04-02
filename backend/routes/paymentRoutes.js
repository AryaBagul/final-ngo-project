const express = require("express");
const router = express.Router();
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

const Donation = require("../models/Donation");

// middleware
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// =============================
// 1. CREATE ORDER
// =============================
router.post(
  "/create-order",
  authMiddleware,
  roleMiddleware("donor"),
  async (req, res) => {
    try {
      const { amount } = req.body;

      const order = await razorpay.orders.create({
        amount: Number(amount) * 100,
        currency: "INR",
        receipt: "receipt_" + Date.now(),
      });

      res.json(order);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Error creating order" });
    }
  }
);


// =============================
// 2. VERIFY PAYMENT + SAVE
// =============================
router.post(
  "/verify",
  authMiddleware,
  roleMiddleware("donor"),
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        ngoId,
        amount,
      } = req.body;

      // 🔐 verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid signature" });
      }

      // ✅ SAVE DONATION
      const donation = await Donation.create({
  donor: req.user.id,
  ngo: ngoId,
  type: "money",
  amount: Number(amount),
  paymentMethod: "online",
  paymentId: razorpay_payment_id,
  status: "completed",
});

      res.json({ success: true, donation });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Verification failed" });
    }
  }
);

module.exports = router;