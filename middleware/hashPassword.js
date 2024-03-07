const bcrypt = require("bcryptjs");

const hashPassword = async (req, res, next) => {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  req.hashedPassword = hashedPassword;
  next();
};

module.exports = { hashPassword };
