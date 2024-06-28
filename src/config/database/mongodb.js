// const config = require('..');
const mongoose = require("mongoose");
require("dotenv").config();

const connectMongoDB = () => {
    try {
        return mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
    } catch (error) {
        console.log("error: ", error);
        return "CONNECTION_ERROR";
    }
};

module.exports = { connectMongoDB };
