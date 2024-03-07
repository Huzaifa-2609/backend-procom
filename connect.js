const mongoose = require("mongoose");

const connectToMongoDB = () =>
  mongoose
    .connect(
      "mongodb+srv://huzaifa:fSVyEPrnUfTkSqaN@cluster0.nuax3wk.mongodb.net/procom"
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));
module.exports = { connectToMongoDB };
