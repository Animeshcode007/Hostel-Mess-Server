const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDailySummary, getMonthlyStudentSummary,getStudentMealLedger  } = require('../controllers/reportController');

router.use(protect);

router.get('/daily-summary', getDailySummary);
router.get('/monthly-student-summary', getMonthlyStudentSummary);
router.get('/student-meal-ledger/:studentId', getStudentMealLedger);

module.exports = router;