// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const deliveryRoutes = require('./routes/delivery.routes');

// Sync database (create tables if they don't exist)
const sequelize = require('./config/database');
sequelize.sync({ force: false }) // Use force: true to drop and recreate tables
    .then(() => {
        console.log('✅ Database tables synchronized');
    })
    .catch(err => console.error('Database sync error:', err));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/delivery', deliveryRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Burger Delivery API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            products: '/api/products',
            orders: '/api/orders',
            payment: '/api/payment',
            admin: '/api/admin',
            favorites: '/api/favorites'
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Test: http://localhost:${PORT}/test`);
});