const express = require("express");
const bodyParser = require("body-parser");
const mongoSanitize = require('express-mongo-sanitize');

const cors = require("cors");
const { connectMongoDB } = require("./config/database/mongodb");
require("dotenv").config();

const app = express();
// Use CORS middleware
app.use(cors());
// Use body-parser middleware to parse incoming requests with JSON payloads
app.use(bodyParser.json());
app.use(mongoSanitize());


app.use(
    mongoSanitize({
        allowDots: true,
        replaceWith: '_',
    }),
);
// Require Routes from ./app/routes
const start = require("./app/routes/start");
const giftRoutes = require("./app/routes/giftRoute");
const productRoutes = require("./app/routes/productRoute");
const authRoutes = require("./app/routes/authRoute");
const customerRoutes = require("./app/routes/customerRoutes");
const dashboard = require("./app/routes/dashboard");
const restaurantRoutes = require("./app/routes/retaurantRotes");
const billRoutes = require("./app/routes/billRoutes");
const fileRoutes = require("./app/routes/file");
const spinRoutes = require("./app/routes/spinRoutes");
const reportRoutes = require("./app/routes/reportRoute");

//API Routes
app.use("/", start);
app.use("/api/v1/gifts", giftRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/auths", authRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/dashboards", dashboard);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/bills", billRoutes);
app.use("/api/v1/files", fileRoutes);
app.use("/api/v1/spins", spinRoutes);
app.use("/api/v1/reports", reportRoutes);

// Connect to MongoDB
connectMongoDB();

const port = 8600;
app.listen(port, () => console.log(`Server is running on port ${port}`));
