const User = require("../models/Users.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, contactNumber, birthdate, address, ngoDetails } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      contactNumber,
      birthdate,
      address,
      ngoDetails: role === "ngo" ? ngoDetails : undefined
    });

    res.status(201).json({
      success: true,
      user: user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Role Validation
   

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      id: user._id,
      contactNumber: user.contactNumber,
      birthdate: user.birthdate,
      address: user.address,
      ngoDetails: user.ngoDetails
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET NGOs
exports.getNGOs = async (req, res) => {
  try {
    const ngos = await User.find({ role: "ngo" }).select("-password");
    res.json({
      success: true,
      ngos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};