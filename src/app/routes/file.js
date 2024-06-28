const express = require("express");
const { getPresignedUrl } = require("../controllers/file");
const router = express.Router();

router.post('/getPresignedUrl', getPresignedUrl);

module.exports = router;
