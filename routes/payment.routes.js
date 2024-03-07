const express = require("express");
const router = express.Router();
const Payment = require("../models/Payments.model.js");
const User = require("../models/User.model.js");
const { verifyToken } = require("../middleware/verifyToken.js");
const {
  validateTransactionRequest,
  validatePaymentAction,
} = require("../middleware/validation.js");
const { generateQRString, parseQRCode } = require("../helpers/index.js");

router.post(
  "/transaction-request",
  // verifyToken,
  validateTransactionRequest,
  async (req, res) => {
    try {
      // if (req.user.role !== "merchant") {
      //   return res.status(403).json({
      //     message: "Forbidden. Only merchants can make transaction requests",
      //   });
      // }

      const {
        customerAccountNumber,
        merchantAccountNumber,
        description,
        amount,
        status,
        currency,
      } = req.body;

      const payment = new Payment({
        customerAccountNumber,
        merchantAccountNumber,
        description,
        amount,
        status,
        currency,
      });

      await payment.save();

      res
        .status(201)
        .json({ message: "Transaction request submitted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.put("/action", verifyToken, validatePaymentAction, async (req, res) => {
  try {
    const { paymentId, action } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (action === "pay") {
      payment.status = "succeeded";
    } else if (action === "reject") {
      payment.status = "rejected";
    }

    await payment.save();

    res.status(200).json({ message: "Payment action performed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/get-payments/:accountId", verifyToken, async (req, res) => {
  try {
    const accountId = req.params.accountId;

    const payments = await Payment.find({ customerAccountNumber: accountId });

    res.status(200).json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get(
  "/payment-requests-summary/:accountNumber",
  verifyToken,
  async (req, res) => {
    try {
      const accountNumber = req.params.accountNumber;

      const pendingRequests = await Payment.countDocuments({
        customerAccountNumber: accountNumber,
        status: "pending",
      });
      const rejectedRequests = await Payment.countDocuments({
        customerAccountNumber: accountNumber,
        status: "rejected",
      });
      const succeededRequests = await Payment.countDocuments({
        customerAccountNumber: accountNumber,
        status: "succeeded",
      });

      res.status(200).json({
        totalPendingRequests: pendingRequests,
        totalRejectedRequests: rejectedRequests,
        totalSucceededRequests: succeededRequests,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/revenue-by-month", verifyToken, async (req, res) => {
  try {
    const revenueData = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const formattedData = revenueData.map((item) => ({
      month: item._id,
      revenue: item.totalRevenue,
    }));

    res.status(200).json({ revenueData: formattedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/qr-code/:paymentId", async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const merchant = await User.findOne({
      accountNumber: payment.merchantAccountNumber,
    });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    let mai = {};
    if (merchant.role === "merchant") {
      mai = merchant.mai.reduce((acc, curr) => {
        acc[curr.scheme] = curr.accountNumber;
        return acc;
      }, {});
    } else throw Error();

    const merchantData = {
      mai,
      mcc: merchant.categoryCode,
      currency: "586",
      countryCode: "PK",
      merchantName: merchant.username,
      amount: payment.amount,
      merchantCity: merchant.city,
    };
    const qrString = await generateQRString(merchantData);
    res.status(200).json({ qrString });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/qr-code/pay", async (req, res) => {
  try {
    const { qrString } = req.body;
    const parsed = parseQRCode(qrString);
    res.status(200).json({ parsed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
