const express = require("express");
const { createGift, getGift, getGifts, deleteGift, updateGift } = require("../controllers/gift");
const router = express.Router();
const { checkAuthorizationMiddleware } = require('../middlewares/index');

router.post('/', checkAuthorizationMiddleware, createGift);
router.get('/:id', getGift);
router.get('/skip/:skip/limit/:limit', getGifts);
router.put('/:id', checkAuthorizationMiddleware, updateGift);
// router.delete('/:id', checkAuthorizationMiddleware, deleteGift);

module.exports = router;
