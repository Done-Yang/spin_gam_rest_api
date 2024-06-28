const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello Appzap Beerlao api is runing');
});

module.exports = router;
