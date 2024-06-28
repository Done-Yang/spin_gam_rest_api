const express = require("express");
const { createProduct, getProduct, getProducts, deleteProduct, updateProduct } = require("../controllers/product");
const router = express.Router();
const { checkAuthorizationMiddleware } = require('../middlewares/index');

router.post('/', checkAuthorizationMiddleware, createProduct);
router.get('/:id', getProduct);
router.get('/skip/:skip/limit/:limit', getProducts);
router.put('/:id', checkAuthorizationMiddleware, updateProduct);
router.delete('/:id', checkAuthorizationMiddleware, deleteProduct);

module.exports = router;
