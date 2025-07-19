const express = require('express');
const router = express.Router();
const { createIssue } = require('../controllers/issueController');

router.post('/issues', createIssue);

module.exports = router;