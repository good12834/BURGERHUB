const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');

// JSON body parser for all payment routes
router.use(express.json());

// Webhook route - uses JSON like other routes
router.post('/webhook', paymentController.handleWebhook);

// Other payment routes
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/confirm', paymentController.confirmPayment);
router.post('/refund/:orderId', protect, admin, paymentController.refundPayment);

// Create a Stripe Checkout session (public)
router.post('/create-checkout-session', async (req, res) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const { items, delivery_address, delivery_instructions, success_url, cancel_url, userId } = req.body;

        const line_items = (items || []).map(i => ({
            price_data: {
                currency: 'usd',
                product_data: { name: i.name },
                unit_amount: Math.round((i.unit_price || i.price || 0) * 100)
            },
            quantity: i.quantity || 1
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: success_url || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?canceled=true`,
            metadata: {
                items: JSON.stringify(items || []),
                delivery_address: delivery_address || '',
                delivery_instructions: delivery_instructions || '',
                userId: userId || ''
            }
        });

        res.json({ success: true, url: session.url });
    } catch (err) {
        console.error('Create checkout session error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;