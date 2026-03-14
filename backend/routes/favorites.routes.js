const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkFavorite
} = require('../controllers/favoritesController');


// All routes are protected
router.use(protect);

// Define routes
router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:id', removeFavorite);
router.get('/check/:productId', checkFavorite);

module.exports = router;