const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/customers", verifyToken, async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" });

    res.status(200).json({ customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
