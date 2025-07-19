const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAttendanceByDate,
    markAttendance
} = require('../controllers/attendanceController');

router.route('/')
    .get(protect, getAttendanceByDate)
    .post(protect, markAttendance);

module.exports = router;