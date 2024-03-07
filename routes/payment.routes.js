const express = require("express");
const router = express.Router();
const Payment = require("../models/Payments.model.js");
const { verifyToken } = require("../middleware/verifyToken.js");
const {
  validateTransactionRequest,
  validatePaymentAction,
} = require("../middleware/validation.js");

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
        crc,
        currency,
      } = req.body;

      const payment = new Payment({
        customerAccountNumber,
        merchantAccountNumber,
        description,
        amount,
        status,
        crc,
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
    if (req.user.role !== "merchant") {
      return res.status(403).json({
        message: "Forbidden. Only merchants can perform payment actions",
      });
    }

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

router.get("/get-payments/:accountId", verifyToken, async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const accNo = req.user.customerAccountNumber;

    if (accountId !== accNo) {
      return res
        .status(403)
        .json({ message: "Forbidden. You can only access your own payments" });
    }

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
      const userId = req.user.customerAccountNumber;

      if (accountNumber !== userId) {
        return res.status(403).json({
          message:
            "Forbidden. You can only access your own payment requests summary",
        });
      }

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

router.get("/qr-code/paymentId", async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const { merchantAccountNumber: merchant } = await Payment.findById(
      paymentId
    ).populate("merchantAccountNumber");

    const merchantData = {
      categoryCode: merchant.categoryCode,
      mcc: merchant.categoryCode,
      currency: "586",
      countryCode: "PK",
      merchantName: merchant.username,
      merchantCity: "Karachi",
    };

    const qrString = generateQRString(merchantData);
    res.status(200).json({ qrString });
  } catch (error) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
