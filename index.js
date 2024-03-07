const express = require("express");
const { connectToMongoDB } = require("./connect.js");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const paymentRoutes = require("./routes/payment.routes.js");

const app = express();

app.use(express.json());

//connect To mongodb
connectToMongoDB();

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));