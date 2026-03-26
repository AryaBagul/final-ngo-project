const router = require("express").Router();
const { register, login, getNGOs } = require("../controllers/authController");
const Users = require("../models/Users");

router.post("/register", register);
router.post("/login", login);
router.get("/ngos", getNGOs);
router.get("/all-ngos", async (req, res) => {
  try {
    const ngos = await Users.find({ role: "ngo" }).select("name location");
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
