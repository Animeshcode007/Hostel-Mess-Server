const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { loginAdmin, changeAdminPassword } = require('../controllers/adminController');

router.post('/login', loginAdmin);

router.put('/profile/change-password', protect, changeAdminPassword);

module.exports = router;