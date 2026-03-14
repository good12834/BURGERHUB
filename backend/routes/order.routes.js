const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderTracking
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Create order
router.post('/', authMiddleware.protect, createOrder);

// Get user orders
router.get('/my-orders', authMiddleware.protect, getUserOrders);

// Get order by ID
router.get('/:id', authMiddleware.protect, getOrderById);

// Update order status
router.put('/:id/status', authMiddleware.protect, updateOrderStatus);

// Cancel order
router.put('/:id/cancel', authMiddleware.protect, cancelOrder);

// Get order tracking
router.get('/:id/tracking', authMiddleware.protect, getOrderTracking);

module.exports = router;