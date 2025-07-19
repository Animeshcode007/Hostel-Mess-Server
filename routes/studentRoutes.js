const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    registerStudent,
    getAllStudents,
    updateStudentStatus,
    reactivateStudent,
    renewSubscription
} = require('../controllers/studentController');

router.route('/')
    .post(protect, registerStudent)
    .get(protect, getAllStudents);

router.route('/:id/status')
    .put(protect, updateStudentStatus);

router.route('/:id/reactivate').put(protect, reactivateStudent);
router.route('/:id/renew').put(protect, renewSubscription);

module.exports = router;