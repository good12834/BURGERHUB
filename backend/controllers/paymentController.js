// backend/controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const DeliveryTracking = require('../models/DeliveryTracking');
const User = require('../models/User');

// @desc    Create payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
    try {
        console.log('DEBUG: Creating payment intent with body:', req.body);
        console.log('DEBUG: Stripe secret key exists:', !!process.env.STRIPE_SECRET_KEY);
        console.log('DEBUG: Stripe secret key starts with:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'NOT SET');

        // Handle case where body might not be properly parsed
        if (!req.body || typeof req.body !== 'object') {
            console.log('DEBUG: Invalid request body detected');
            return res.status(400).json({
                success: false,
                message: 'Invalid request body'
            });
        }

        const { orderId, amount, items, userId } = req.body;

        console.log('Parsed payment intent data:', { orderId, amount, items, userId });

        // Calculate amount from items if not provided
        let totalAmount = amount;
        if (!totalAmount && items && items.length > 0) {
            totalAmount = items.reduce((sum, item) => {
                return sum + (item.quantity * (item.unit_price || item.price || 0));
            }, 0);
        }

        console.log('Calculated totalAmount:', totalAmount);

        // Default amount if nothing provided
        if (!totalAmount || totalAmount <= 0) {
            totalAmount = 2599; // $25.99 fallback
        }

        console.log('DEBUG: Final totalAmount:', totalAmount);

        // Convert to cents if needed (if amount is in dollars)
        const amountInCents = totalAmount < 100 ? totalAmount * 100 : totalAmount;

        console.log('DEBUG: Creating Stripe payment intent with amount:', amountInCents);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amountInCents),
            currency: 'usd',
            metadata: {
                orderId: orderId || 'temp_order_' + Date.now(),
                userId: userId || '1',
                orderNumber: 'ORD' + Date.now(),
                items: JSON.stringify(items || [])
            }
        });

        console.log('DEBUG: Payment intent created successfully:', paymentIntent.id);
        console.log('DEBUG: Payment intent status:', paymentIntent.status);

        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment',
            error: error.message
        });
    }
};

// @desc    Confirm payment
// @route   POST /api/payment/confirm
// @access  Private
const confirmPayment = async (req, res) => {
    try {
        console.log('Confirming payment with body:', req.body);

        // Handle case where body might not be properly parsed
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body'
            });
        }

        const { paymentIntentId } = req.body;
        console.log('Received paymentIntentId:', paymentIntentId);

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Missing paymentIntentId'
            });
        }

        console.log('Retrieving payment intent from Stripe...');
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        console.log('Payment intent retrieved:', paymentIntent.id, 'status:', paymentIntent.status);

        if (paymentIntent.status === 'succeeded') {
            const order = await Order.findByPk(paymentIntent.metadata.orderId);

            console.log('Found order:', order ? order.id : 'not found');

            if (order) {
                await order.update({
                    payment_status: 'paid',
                    status: 'confirmed'
                });

                // Emit payment confirmation event
                const io = req.app.get('io');
                io.to(`order_${order.id}`).emit('payment_confirmed', {
                    orderId: order.id,
                    paymentIntentId
                });
            }

            res.json({
                success: true,
                message: 'Payment confirmed successfully',
                data: {
                    orderId: paymentIntent.metadata.orderId,
                    paymentStatus: 'paid'
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: `Payment not successful: ${paymentIntent.status}`
            });
        }
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming payment',
            error: error.message
        });
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payment/webhook
// @access  Public
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Bypass signature verification in test mode
        if (req.headers['x-test-webhook']) {
            event = req.body;
        } else {
            // Get raw request body for signature verification
            const rawBody = req.rawBody || req.body;
            event = stripe.webhooks.constructEvent(
                rawBody,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            try {
                const order = await Order.findByPk(paymentIntent.metadata.orderId);

                if (order) {
                    await order.update({
                        payment_status: 'paid',
                        status: 'confirmed'
                    });

                    // Add delivery tracking
                    await DeliveryTracking.create({
                        order_id: order.id,
                        status: 'confirmed',
                        notes: 'Payment received, order confirmed'
                    });

                    console.log(`Order ${order.order_number} payment succeeded`);
                }
            } catch (error) {
                console.error('Error updating order after payment:', error);
            }
            break;

        case 'checkout.session.completed':
            try {
                const session = event.data.object;
                // Retrieve the session to get payment_intent if needed
                const fullSession = await stripe.checkout.sessions.retrieve(session.id);

                // Parse metadata (items) if present
                const metadata = fullSession.metadata || {};
                const itemsJson = metadata.items || null;
                let items = [];
                if (itemsJson) {
                    try { items = JSON.parse(itemsJson); } catch (e) { items = []; }
                }

                // Create order record if not existing
                const totalAmount = (fullSession.amount_total || 0) / 100;
                const userId = metadata.userId ? parseInt(metadata.userId, 10) : (metadata.user_id ? parseInt(metadata.user_id, 10) : 1);
                const deliveryAddress = metadata.delivery_address || 'N/A';

                const newOrder = await Order.create({
                    user_id: userId || 1,
                    total_amount: totalAmount,
                    payment_status: 'paid',
                    status: 'confirmed',
                    payment_method: 'stripe',
                    delivery_address: deliveryAddress,
                    delivery_instructions: metadata.delivery_instructions || null
                });

                // Create order items
                for (const it of items) {
                    try {
                        await OrderItem.create({
                            order_id: newOrder.id,
                            product_id: it.product_id || null,
                            product_name: it.name || 'Item',
                            quantity: it.quantity || 1,
                            unit_price: it.unit_price || it.price || 0,
                            total_price: (it.quantity || 1) * (it.unit_price || it.price || 0),
                            customizations: it.customizations || {}
                        });
                    } catch (err) { console.error('Error creating order item from webhook:', err); }
                }

                console.log(`Created order ${newOrder.order_number} from Checkout Session`);
            } catch (err) {
                console.error('Error processing checkout.session.completed:', err);
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;

            try {
                const order = await Order.findByPk(failedPayment.metadata.orderId);

                if (order) {
                    await order.update({ payment_status: 'failed' });
                    console.log(`Order ${order.order_number} payment failed`);
                }
            } catch (error) {
                console.error('Error updating failed payment:', error);
            }
            break;

        case 'charge.refunded':
            const refund = event.data.object;

            try {
                const order = await Order.findByPk(refund.metadata.orderId);

                if (order) {
                    await order.update({ payment_status: 'refunded' });
                    console.log(`Order ${order.order_number} refunded`);
                }
            } catch (error) {
                console.error('Error updating refund:', error);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

// @desc    Refund payment (Admin only)
// @route   POST /api/payment/refund/:orderId
// @access  Private/Admin
const refundPayment = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findByPk(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Order is not eligible for refund'
            });
        }

        // Find the payment intent
        const paymentIntents = await stripe.paymentIntents.list({
            limit: 10,
            metadata: { orderId: order.id.toString() }
        });

        if (paymentIntents.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const paymentIntent = paymentIntents.data[0];

        // Create refund
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntent.id,
            reason: reason || 'requested_by_customer',
            metadata: {
                orderId: order.id.toString(),
                refundedBy: req.user.id.toString()
            }
        });

        await order.update({ payment_status: 'refunded' });

        // Add tracking for refund
        await DeliveryTracking.create({
            order_id: order.id,
            status: 'refunded',
            notes: `Payment refunded: ${reason || 'No reason provided'}`,
            updated_by: req.user.id
        });

        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: refund
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};


module.exports = {
    createPaymentIntent,
    confirmPayment,
    handleWebhook,
    refundPayment
};