const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all favorites for a user
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
 try {
  const favorites = await Favorite.findAll({
   where: { user_id: req.user.id },
   include: [
    {
     model: Product,
     as: 'product'
    }
   ]
  });

  res.status(200).json({
   success: true,
   data: favorites
  });
 } catch (error) {
  console.error('Error getting favorites:', error);
  res.status(500).json({
   success: false,
   message: 'Server error'
  });
 }
};

// @desc    Add a product to favorites
// @route   POST /api/favorites
// @access  Private
const addFavorite = async (req, res) => {
 try {
  const { product_id } = req.body;

  // Check if product exists
  const product = await Product.findByPk(product_id);
  if (!product) {
   return res.status(404).json({
    success: false,
    message: 'Product not found'
   });
  }

  // Check if already in favorites
  const existingFavorite = await Favorite.findOne({
   where: {
    user_id: req.user.id,
    product_id: product_id
   }
  });

  if (existingFavorite) {
   return res.status(400).json({
    success: false,
    message: 'Product already in favorites'
   });
  }

  const favorite = await Favorite.create({
   user_id: req.user.id,
   product_id: product_id
  });

  // Include product data in response
  const favoriteWithProduct = await Favorite.findByPk(favorite.id, {
   include: [
    {
     model: Product,
     as: 'product'
    }
   ]
  });

  res.status(201).json({
   success: true,
   data: favoriteWithProduct
  });
 } catch (error) {
  console.error('Error adding favorite:', error);
  res.status(500).json({
   success: false,
   message: 'Server error'
  });
 }
};

// @desc    Remove a product from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
const removeFavorite = async (req, res) => {
 try {
  const { id } = req.params;

  const favorite = await Favorite.findOne({
   where: {
    id: id,
    user_id: req.user.id
   }
  });

  if (!favorite) {
   return res.status(404).json({
    success: false,
    message: 'Favorite not found'
   });
  }

  await favorite.destroy();

  res.status(200).json({
   success: true,
   message: 'Favorite removed successfully'
  });
 } catch (error) {
  console.error('Error removing favorite:', error);
  res.status(500).json({
   success: false,
   message: 'Server error'
  });
 }
};

// @desc    Check if a product is in favorites
// @route   GET /api/favorites/check/:productId
// @access  Private
const checkFavorite = async (req, res) => {
 try {
  const { productId } = req.params;

  const favorite = await Favorite.findOne({
   where: {
    user_id: req.user.id,
    product_id: productId
   }
  });

  res.status(200).json({
   success: true,
   data: {
    isFavorite: !!favorite
   }
  });
 } catch (error) {
  console.error('Error checking favorite:', error);
  res.status(500).json({
   success: false,
   message: 'Server error'
  });
 }
};

module.exports = {
 getFavorites,
 addFavorite,
 removeFavorite,
 checkFavorite
};
