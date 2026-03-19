const router = require("express").Router();
const { register, login, getNGOs } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/ngos", getNGOs);

module.exports = router;
