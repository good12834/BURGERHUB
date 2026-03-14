const express = require('express');
const router = express.Router();
const {
 getAssignedOrders,
 updateDeliveryLocation,
 markAsDelivered,
 getDeliveryStats
} = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/auth');

// Get delivery person's assigned orders
router.get('/orders', authMiddleware.protect, getAssignedOrders);

// Update delivery location
router.post('/location/:orderId', authMiddleware.protect, updateDeliveryLocation);

// Mark order as delivered
router.put('/deliver/:orderId', authMiddleware.protect, markAsDelivered);

// Get delivery statistics
router.get('/stats', authMiddleware.protect, getDeliveryStats);

module.exports = router;