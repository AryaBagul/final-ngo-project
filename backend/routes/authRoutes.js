
const router = require("express").Router();

// ✅ FIX: added updateLinks here
const { register, login, getNGOs, updateLinks } = require("../controllers/authController");

const Users = require("../models/Users");

router.post("/register", register);
router.post("/login", login);
router.get("/ngos", getNGOs);

router.get("/all-ngos", async (req, res) => {
  try {
   const ngos = await Users.find({ role: "ngo" }).select(
  "name email ngoDetails"
);
    res.json(ngos);
  } catch (err) {
    console.error("Error in /all-ngos:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ now this works
router.put("/update-links", updateLinks);

module.exports = router;

