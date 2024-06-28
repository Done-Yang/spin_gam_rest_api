const express = require("express");
const { createCustomer, getCustomers, getCustomer, getCustomerByPhone } = require("../controllers/customer");
const router = express.Router();
const { checkAuthorizationMiddleware } = require('../middlewares/index');

router.post('/', createCustomer);
router.get('/skip/:skip/limit/:limit', getCustomers);
router.get('/:id', getCustomer);
router.get('/phone/:phone', getCustomerByPhone);

module.exports = router;