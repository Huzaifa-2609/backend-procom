const mongoose = require("mongoose");
const User = require("./User.model");

const paymentSchema = new mongoose.Schema(
  {
    customerAccountNumber: {
      type: String,
      required: true,
      ref: "User",
    },
    merchantAccountNumber: {
      type: String,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: ["succeeded", "pending", "rejected"],
      default: "pending",
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    crc: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre("save", async function (next) {
  try {
    const customer = await User.findOne({
      accountNumber: this.customerAccountNumber,
    });
    const merchant = await User.findOne({
      accountNumber: this.merchantAccountNumber,
    });

    if (!customer || customer.role !== "customer") {
      throw new Error("Customer does not exist or is not a valid customer");
    }

    if (!merchant || merchant.role !== "merchant") {
      throw new Error("Merchant does not exist or is not a valid merchant");
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
