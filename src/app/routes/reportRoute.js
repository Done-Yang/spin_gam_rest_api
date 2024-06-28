const express = require("express");
const { getReports, getReportById, updateReport, reportSpinAndScan } = require("../controllers/report");
const router = express.Router();
const { checkAuthorizationMiddleware } = require('../middlewares/index');

router.get('/skip/:skip/limit/:limit', checkAuthorizationMiddleware, getReports);
router.get('/:id', checkAuthorizationMiddleware, getReportById);
router.put('/', checkAuthorizationMiddleware, updateReport);
router.get('/scansAndSpins/total', checkAuthorizationMiddleware, reportSpinAndScan);

module.exports = router;

