const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Bearer token missing" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, "procom2024", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized. Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken };
