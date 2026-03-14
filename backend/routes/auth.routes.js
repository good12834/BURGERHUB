const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route working' });
});

// Register user
router.post('/register',
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    authController.registerUser
);

// Login user
router.post('/login',
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    authController.loginUser
);

// Get user profile (protected)
router.get('/profile', protect, authController.getUserProfile);

// Update user profile (protected)
router.put('/profile', protect, authController.updateUserProfile);

// Change password (protected)
router.put('/change-password', protect, authController.changePassword);

module.exports = router;