const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
// ➕ Create Donation
router.post("/", async (req, res) => {
    try {
        const { donor, ngo, type, amount, items, paymentMethod } = req.body;

        const donation = new Donation({
            donor,
            ngo,
            type,
            amount,
            items,
            paymentMethod,
        });

        await donation.save();

        res.status(201).json({
            success: true,
            message: "Donation successful",
            donation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating donation",
            error: error.message,
        });
    }
});
// Get all donations
router.get("/", async (req, res) => {
    try {
        const donations = await Donation.find()
            .populate("donor", "name email")
            .populate("ngo", "name email");

        res.json({
            success: true,
            donations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
// Get donations for a specific NGO
router.get("/ngo/:ngoId", async (req, res) => {
    try {
        const { ngoId } = req.params;

        const donations = await Donation.find({ ngo: ngoId })
            .populate("donor", "name email");

        res.json({
            success: true,
            donations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
router.put(
    "/:id/status",
    authMiddleware,
    async (req, res) => {
        try {
            const { status } = req.body;
            const donationId = req.params.id;

            const donation = await Donation.findById(donationId);

            if (!donation) {
                return res.status(404).json({ message: "Donation not found" });
            }

            // 🔒 CHECK: Only NGO who owns donation OR admin
            if (
                req.user.role === "ngo" &&
                donation.ngo.toString() !== req.user.id
            ) {
                return res.status(403).json({ message: "Not authorized" });
            }

            if (req.user.role === "donor") {
                return res.status(403).json({ message: "Donor cannot update status" });
            }

            donation.status = status;
            await donation.save();

            res.json({
                success: true,
                donation,
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);
router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const donations = await Donation.find()
                .populate("donor", "name email")
                .populate("ngo", "name email");

            res.json({
                success: true,
                donations,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);
module.exports = router;