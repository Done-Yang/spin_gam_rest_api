const express = require("express");
const multer = require("multer");
const { createBill, uploadBill } = require("../controllers/bill");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", createBill);
router.post("/upload-bill", upload.single("image"), uploadBill);

module.exports = router;
