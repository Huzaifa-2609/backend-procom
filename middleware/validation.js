const validateSignupInput = (req, res, next) => {
  const {
    username,
    email,
    password,
    phoneNumber,
    accountNumber,
    accountName,
    city,
    countryCode,
  } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    !phoneNumber ||
    !accountNumber ||
    !accountName ||
    !city ||
    !countryCode
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  next();
};

const validateMerchantSignupInput = (req, res, next) => {
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

  if (
    !username ||
    !email ||
    !phoneNumber ||
    !accountNumber ||
    !countryCode ||
    !city ||
    !categoryCode ||
    !accountName ||
    !mai
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  next();
};

const isValidEmail = (email) => {
  // Regular expression to check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateTransactionRequest = (req, res, next) => {
  const {
    customerAccountNumber,
    merchantAccountNumber,
    description,
    amount,
    status,
    currency,
  } = req.body;

  if (
    !customerAccountNumber ||
    !merchantAccountNumber ||
    !description ||
    !amount ||
    !status ||
    !currency
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }

  next();
};

const validatePaymentAction = (req, res, next) => {
  const { paymentId, action } = req.body;

  // Validate required fields
  if (!paymentId || !action) {
    return res
      .status(400)
      .json({ message: "Payment ID and action are required" });
  }

  // Validate action
  if (action !== "pay" && action !== "reject") {
    return res.status(400).json({
      message: "Invalid action. Valid actions are 'pay' and 'reject'",
    });
  }

  next();
};

module.exports = {
  validateSignupInput,
  validateTransactionRequest,
  validatePaymentAction,
  validateMerchantSignupInput,
};
