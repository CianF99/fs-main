const express = require('express');
const router = express.Router();
const { getUsers, getUserProfile } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.get('/', protect, adminOnly, getUsers);

module.exports = router;
