const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Register a new user
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    res.json({ message: "Login successful", user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.tokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `https://your-netlify-app.netlify.app/reset-password/${token}`;
    await sendEmail(email, "Password Reset", `Click to reset password: ${resetLink}`);

    res.json({ message: "Reset link sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetToken: token,
    tokenExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  res.json({ message: "Valid token" });
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetToken: token,
    tokenExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Token expired" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.tokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password updated" });
};
