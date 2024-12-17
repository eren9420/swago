const express = require('express');
const { registerUser, loginUser, updateProfile, getUserById } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { getUserProfile } = require('../controllers/authController');


const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/profile', protect, getUserProfile);

router.put('/update-profile', protect, updateProfile);

module.exports = router;
