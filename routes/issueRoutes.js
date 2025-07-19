const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createIssue,
    getAllIssues,
    updateIssueStatus
} = require('../controllers/issueController');

router.route('/').post(createIssue);

router.route('/').get(protect, getAllIssues);
router.route('/:id/status').put(protect, updateIssueStatus);

module.exports = router;