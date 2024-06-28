const jwt = require("jsonwebtoken");
const configs = require('../../config');
require("dotenv").config();

exports.generateTokens = async (data) => {
    try {
        //  Generate Token
        const accessToken = jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_TOKEN_EXPIRES });

        //  Response
        return { accessToken }
    } catch (error) {
        console.log("error: 5", error)
        return null
    }
}


exports.checkAuthorizationMiddleware = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const accessToken = req.headers.authorization.replace('Bearer ', "");
            const payloadData = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
            req.user = payloadData;
            next();
        } else {
            return res.status(configs.messages.INVALID_DATA_NUMBER).json({ message: configs.messages.AUTHORIZATION_REQUIRED });
        }
    } catch (error) {
        console.log("error:1 ", error.name)
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'TOKEN_EXPIRED' });
        }
        return null;
    }
}

exports.getUserDataOnToken = (req, res) => {
    try {
        if (req.headers.authorization) {
            const accessToken = req.headers.authorization.split(" ")[1];
            const { name } = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
            return { name }
        }
    } catch (error) {
        console.log("error: 6", error)
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'TOKEN_EXPIRED' });
        }
        return null;
    }
}
