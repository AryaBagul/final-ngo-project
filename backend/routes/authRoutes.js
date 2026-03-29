const router = require("express").Router();
const { register, login, getNGOs } = require("../controllers/authController");
const Users = require("../models/Users");

router.post("/register", register);
router.post("/login", login);
router.get("/ngos", getNGOs);
router.get("/all-ngos", async (req, res) => {
  try {
    const ngos = await Users.find({ role: "ngo" });

    res.json(ngos);
  } catch (err) {
    console.error("Error in /all-ngos:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
