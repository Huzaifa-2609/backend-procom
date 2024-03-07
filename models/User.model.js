const mongoose = require("mongoose");

const maiSchemeSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  code: {
    type: String,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "merchant"],
      default: "customer",
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    categoryCode: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    scheme: [maiSchemeSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
