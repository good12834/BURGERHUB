// backend/controllers/orderController.js
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const DeliveryTracking = require('../models/DeliveryTracking');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmation, sendDeliveryUpdate } = require('../utils/emailService');
const { Op } = require('sequelize');
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        console.log('Received order data:', req.body);
        const {
            items,
            delivery_address,
            delivery_instructions,
            payment_method,
            coupon_code = null,
            discount_amount = 0
        } = req.body;
        if (!items || items.length === 0) {
            console.log('Validation failed: No items in order');
            return res.status(400).json({
                success: false,
                message: 'No items in order'
            });
        }

        if (!delivery_address || delivery_address.trim() === '') {
            console.log('Validation failed: Delivery address is required, received:', delivery_address);
            return res.status(400).json({
                success: false,
                message: 'Delivery address is required'
            });
        }

        // Calculate subtotal and verify items
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product_id} not found`
                });
            }

            if (!product.is_available) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is not available`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                unit_price: product.price,
                total_price: itemTotal,
                customizations: item.customizations || {}
            });
        }

        // Calculate delivery fee (free if subtotal > 20)
        const deliveryFee = subtotal > 20 ? 0 : 3.99;

        // Calculate total amount
        const total_amount = subtotal + deliveryFee - (discount_amount || 0);

        // Get customer details from database
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const customer_name = user.name;
        const customer_email = user.email;
        const customer_phone = user.phone || '';

        const order = await Order.create({
            user_id: req.user.id,
            order_number: `ORD${Date.now().toString().slice(-10)}`, // Will be overridden by trigger if using MySQL
            subtotal,
            tax_amount: 0, // Tax calculation can be added later
            delivery_fee: deliveryFee,
            discount_amount: discount_amount || 0,
            coupon_code,
            total_amount,
            delivery_address,
            delivery_instructions,
            payment_method,
            status: 'pending',
            payment_status: 'pending',
            customer_name,
            customer_email,
            customer_phone
        });

        // Create order items
        await Promise.all(orderItems.map(item =>
            OrderItem.create({
                ...item,
                order_id: order.id
            })
        ));

        // Create initial delivery tracking
        await DeliveryTracking.create({
            order_id: order.id,
            status: 'pending',
            notes: 'Order has been placed and is pending confirmation'
        });

        // Send email confirmation
        try {
            await sendOrderConfirmation(req.user.email, order);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        // Emit socket event for new order (if socket.io is available)
        const io = req.app.get('io');
        if (io) {
            io.emit('new_order', {
                orderId: order.id,
                orderNumber: order.order_number
            });
        }

        // Fetch complete order with items
        const completeOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                },
                {
                    model: DeliveryTracking,
                    as: 'tracking',
                    limit: 1,
                    order: [['created_at', 'DESC']]
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: completeOrder,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getUserOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const whereConditions = { user_id: req.user.id };

        if (status) {
            whereConditions.status = status;
        }

        const offset = (page - 1) * limit;

        const orders = await Order.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                orders: orders.rows,
                total: orders.count,
                page: parseInt(page),
                totalPages: Math.ceil(orders.count / limit)
            }
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { order_number: req.params.id },
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                },
                {
                    model: DeliveryTracking,
                    as: 'tracking',
                    order: [['created_at', 'ASC']]
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'delivery') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// @desc    Update order status (Admin/Delivery only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Delivery
const updateOrderStatus = async (req, res) => {
    try {
        const { status, notes, location } = req.body;
        const order = await Order.findOne({
            where: { order_number: req.params.id },
            include: [
                {
                    model: User,
                    attributes: ['id', 'email', 'name']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        await order.update({ status });

        // Add delivery tracking
        const tracking = await DeliveryTracking.create({
            order_id: order.id,
            status,
            location_lat: location?.lat,
            location_lng: location?.lng,
            notes,
            updated_by: req.user.id
        });

        // Send email notification for status update
        try {
            await sendDeliveryUpdate(order.User.email, order, status);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        // Calculate estimated delivery time for certain statuses
        if (status === 'confirmed') {
            const estimatedTime = new Date();
            estimatedTime.setMinutes(estimatedTime.getMinutes() + 45); // 45 minutes estimation
            await order.update({ estimated_delivery_time: estimatedTime });
        }

        // Emit socket event for real-time tracking
        const io = req.app.get('io');
        io.to(`order_${order.id}`).emit('order_status_update', {
            orderId: order.id,
            status,
            location,
            notes,
            timestamp: new Date()
        });

        res.json({
            success: true,
            data: {
                order,
                tracking
            },
            message: `Order status updated to ${status}`
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// @desc    Cancel order (User/Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ where: { order_number: req.params.id } });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns the order or is admin
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        const cancellableStatuses = ['pending', 'confirmed'];
        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled when status is ${order.status}`
            });
        }

        await order.update({ status: 'cancelled' });

        // Add tracking for cancellation
        await DeliveryTracking.create({
            order_id: order.id,
            status: 'cancelled',
            notes: req.body.reason || 'Order cancelled by user',
            updated_by: req.user.id
        });

        // Emit cancellation event
        const io = req.app.get('io');
        io.to(`order_${order.id}`).emit('order_cancelled', {
            orderId: order.id,
            reason: req.body.reason
        });

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
};

// @desc    Get order tracking history
// @route   GET /api/orders/:id/tracking
// @access  Private
const getOrderTracking = async (req, res) => {
    try {
        const order = await Order.findOne({ where: { order_number: req.params.id } });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'delivery') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const tracking = await DeliveryTracking.findAll({
            where: { order_id: order.id },
            include: [
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'name', 'role']
                }
            ],
            order: [['created_at', 'ASC']]
        });

        res.json({
            success: true,
            data: tracking
        });
    } catch (error) {
        console.error('Get tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tracking',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderTracking
};