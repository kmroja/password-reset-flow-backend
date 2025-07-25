const express = require("express");
const router = express.Router();
const {
 registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyResetToken
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken);
router.post("/reset-password", resetPassword);

module.exports = router;
