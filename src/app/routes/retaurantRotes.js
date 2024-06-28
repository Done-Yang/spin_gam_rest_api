const express = require("express");
const { createRestaurant } = require("../controllers/restaurant");
const router = express.Router();

router.post('/', createRestaurant);

module.exports = router;
