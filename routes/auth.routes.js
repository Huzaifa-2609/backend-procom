const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");
const {
  validateSignupInput,
  validateMerchantSignupInput,
} = require("../middleware/validation.js");
const { hashPassword } = require("../middleware/hashPassword.js");

router.post(
  "/signup/customer",
  validateSignupInput,
  hashPassword,
  async (req, res) => {
    try {
      const { username, email, phoneNumber, accountNumber, city, accountName } =
        req.body;
      const hashedPassword = req.hashedPassword;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User({
        username,
        email,
        password: hashedPassword,
        role: "customer",
        phoneNumber,
        accountNumber,
        city,
        accountName,
      });

      await user.save();

      return res.status(201).json({ message: "Customer created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  "/signup/merchant",
  validateMerchantSignupInput,
  hashPassword,
  async (req, res) => {
    try {
      const {
        username,
        email,
        phoneNumber,
        accountNumber,
        countryCode,
        city,
        categoryCode,
        accountName,
        mai,
      } = req.body;
      const hashedPassword = req.hashedPassword;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User({
        username,
        email,
        password: hashedPassword,
        role: "merchant",
        phoneNumber,
        accountNumber,
        countryCode,
        city,
        categoryCode,
        accountName,
        mai,
      });

      await user.save();

      res.status(201).json({ message: "Merchant created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.post("/signin", hashPassword, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ user: user }, "procom2024", {
      expiresIn: "30d",
    });

    res.status(200).json({ user: { token, ...user._doc } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
