const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    getProductById, 
    getFeaturedProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    getCategories
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin routes
router.post('/admin', protect, admin, createProduct);
router.put('/admin/:id', protect, admin, updateProduct);
router.delete('/admin/:id', protect, admin, deleteProduct);

module.exports = router;