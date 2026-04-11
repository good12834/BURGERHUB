const express = require('express');
const router = express.Router();
const { Order, OrderItem } = require('../models');
const { protect } = require('../middleware/auth');

router.get('/test', (req, res) => {
    res.json({ message: 'User route working' });
});

router.get('/orders', protect, async (req, res) => {
    try {
        console.log('Fetching orders for user:', req.user.id);
        const orders = await Order.findAll({
            where: { user_id: req.user.id },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    attributes: ['id', 'product_name', 'quantity', 'unit_price', 'total_price', 'customizations']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        console.log('Orders found:', orders.length);

        // Transform the data to match frontend expectations
        const transformedOrders = orders.map(order => ({
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at,
            total_amount: order.total_amount ? parseFloat(order.total_amount) : 0,
            payment_method: order.payment_method || 'card',
            payment_status: order.payment_status || 'pending',
            delivery_address: order.delivery_address || '',
            delivery_instructions: order.delivery_instructions || '',
            estimated_delivery_time: order.estimated_delivery_time,
            status: order.status === 'out_for_delivery' ? 'on_the_way' : order.status,
            items: (order.items || []).map(item => ({
                id: item.id,
                name: item.product_name || '',
                product_name: item.product_name || '',
                qty: item.quantity || 0,
                quantity: item.quantity || 0,
                price: item.unit_price ? parseFloat(item.unit_price) : 0,
                unit_price: item.unit_price ? parseFloat(item.unit_price) : 0,
                addons: item.customizations?.addons || [],
                customizations: item.customizations || {}
            })),
            driver: null,
            eta: null
        }));

        res.json({
            success: true,
            data: transformedOrders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

module.exports = router;