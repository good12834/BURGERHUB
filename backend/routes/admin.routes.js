const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllOrders, 
    getAllUsers, 
    updateUserRole, 
    getSalesReport 
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);
router.get('/reports/sales', getSalesReport);
router.put('/users/:id/role', updateUserRole);

module.exports = router;