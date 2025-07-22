const express = require('express');
const router = express.Router();
const { getMyLedger, getMyAttendance } = require('../controllers/studentDataController');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

router.use(protectStudent);

router.get('/my-ledger', getMyLedger);
router.get('/my-attendance', getMyAttendance);

module.exports = router;