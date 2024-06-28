const express = require("express");
const { createSpin, getSpinHistory, approveSpin, getCustomerSpinAmount } = require("../controllers/spin");
const router = express.Router();

router.post('/', createSpin);
router.get('/customer/:customer', getSpinHistory);
router.get('/customer/:customer/spinAmount', getCustomerSpinAmount);
router.put('/spproveSpin/:spinId', approveSpin);

module.exports = router;
