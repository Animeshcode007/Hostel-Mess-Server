const express = require('express');
const router = express.Router();
const { loginStudent, getMyProfile } = require('../controllers/studentAuthController');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

router.post('/login', loginStudent);
router.get('/me', protectStudent, getMyProfile);

module.exports = router;