// backend/controllers/deliveryController.js
const Order = require('../models/Order');
const DeliveryTracking = require('../models/DeliveryTracking');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Get delivery person's assigned orders
// @route   GET /api/delivery/orders
// @access  Private/Delivery
const getAssignedOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                delivery_person_id: req.user.id,
                status: {
                    [Op.in]: ['ready', 'out_for_delivery']
                }
            },
            include: [
                {
                    model: User,
                    as: 'customer',
                    attributes: ['id', 'name', 'phone', 'address']
                },
                {
                    model: OrderItem,
                    as: 'items'
                }
            ],
            order: [['estimated_delivery_time', 'ASC']]
        });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get assigned orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// @desc    Update delivery location
// @route   POST /api/delivery/location/:orderId
// @access  Private/Delivery
const updateDeliveryLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const orderId = req.params.orderId;

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify delivery person is assigned to this order
        if (order.delivery_person_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order'
            });
        }

        // Create tracking update
        const tracking = await DeliveryTracking.create({
            order_id: orderId,
            status: order.status,
            location_lat: lat,
            location_lng: lng,
            notes: 'Delivery location updated',
            updated_by: req.user.id
        });

        // Emit location update to customer
        const io = req.app.get('io');
        io.to(`order_${orderId}`).emit('delivery_location_update', {
            orderId,
            location: { lat, lng },
            timestamp: new Date()
        });

        res.json({
            success: true,
            data: tracking,
            message: 'Location updated successfully'
        });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};

// @desc    Mark order as delivered
// @route   PUT /api/delivery/deliver/:orderId
// @access  Private/Delivery
const markAsDelivered = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { notes, photo_url } = req.body;

        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: User,
                    as: 'customer'
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify delivery person is assigned
        if (order.delivery_person_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Update order status
        await order.update({
            status: 'delivered',
            actual_delivery_time: new Date()
        });

        // Create tracking entry
        await DeliveryTracking.create({
            order_id: orderId,
            status: 'delivered',
            notes: notes || 'Order delivered successfully',
            photo_url,
            updated_by: req.user.id
        });

        // Notify customer
        const io = req.app.get('io');
        io.to(`order_${orderId}`).emit('order_delivered', {
            orderId,
            message: 'Your order has been delivered!',
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Order marked as delivered'
        });
    } catch (error) {
        console.error('Mark delivered error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating delivery status',
            error: error.message
        });
    }
};

// @desc    Get delivery statistics
// @route   GET /api/delivery/stats
// @access  Private/Delivery
const getDeliveryStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalDelivered = await Order.count({
            where: {
                delivery_person_id: req.user.id,
                status: 'delivered'
            }
        });

        const todayDelivered = await Order.count({
            where: {
                delivery_person_id: req.user.id,
                status: 'delivered',
                delivered_at: {
                    [Op.gte]: today
                }
            }
        });

        const pendingDeliveries = await Order.count({
            where: {
                delivery_person_id: req.user.id,
                status: 'out_for_delivery'
            }
        });

        // Calculate average delivery time
        const deliveredOrders = await Order.findAll({
            where: {
                delivery_person_id: req.user.id,
                status: 'delivered',
                actual_delivery_time: {
                    [Op.not]: null
                }
            },
            attributes: [
                'id',
                'created_at',
                'actual_delivery_time'
            ]
        });

        let avgDeliveryTime = 0;
        if (deliveredOrders.length > 0) {
            const totalTime = deliveredOrders.reduce((sum, order) => {
                const deliveryTime = new Date(order.actual_delivery_time) - new Date(order.created_at);
                return sum + deliveryTime;
            }, 0);
            avgDeliveryTime = totalTime / deliveredOrders.length / (1000 * 60); // Convert to minutes
        }

        res.json({
            success: true,
            data: {
                totalDelivered,
                todayDelivered,
                pendingDeliveries,
                averageDeliveryTime: Math.round(avgDeliveryTime),
                totalDeliveries: deliveredOrders.length
            }
        });
    } catch (error) {
        console.error('Get delivery stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
};


module.exports = {
    getAssignedOrders,
    updateDeliveryLocation,
    markAsDelivered,
    getDeliveryStats
};