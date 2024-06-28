const express = require("express");
const { getCustomers, getTopRestaurants, getScanAndSpin, getSpinGiftDetial, getSales, getSpinTotalsByHourPeriod } = require("../controllers/dashboard");
const router = express.Router();
const { checkAuthorizationMiddleware } = require('../middlewares/index');

router.get('/customers', checkAuthorizationMiddleware, getCustomers);
router.get('/topRestaurants', checkAuthorizationMiddleware, getTopRestaurants);
router.get('/scanAndSpins', getScanAndSpin);
router.get('/spinGiftDetials', checkAuthorizationMiddleware, getSpinGiftDetial);
router.get('/sales', checkAuthorizationMiddleware, getSales);
router.get('/spinPeroids', checkAuthorizationMiddleware, getSpinTotalsByHourPeriod);

module.exports = router;