// backend/controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const CustomizationOption = require('../models/CustomizationOption');
const { Op } = require('sequelize');
// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            sort,
            includeUnavailable
        } = req.query;

        // Build filter conditions - for admin, show all if includeUnavailable is true
        const whereConditions = {};

        // Only filter by availability for non-admin requests
        if (!includeUnavailable) {
            whereConditions.is_available = true;
        }

        if (category && category !== 'All') {
            whereConditions.category_id = category;
        }

        if (search) {
            whereConditions[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (minPrice || maxPrice) {
            whereConditions.price = {};
            if (minPrice) whereConditions.price[Op.gte] = minPrice;
            if (maxPrice) whereConditions.price[Op.lte] = maxPrice;
        }

        // Build sort order
        let order = [['created_at', 'DESC']];
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    order = [['price', 'ASC']];
                    break;
                case 'price_desc':
                    order = [['price', 'DESC']];
                    break;
                case 'name_asc':
                    order = [['name', 'ASC']];
                    break;
                case 'popular':
                    order = [['order_count', 'DESC']];
                    break;
            }
        }

        // Fetch products
        const products = await Product.findAll({
            where: whereConditions,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: CustomizationOption,
                    as: 'customizations',
                    required: false
                }
            ],
            order
        });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: CustomizationOption,
                    as: 'customizations'
                }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {
                is_available: true,
                is_featured: true
            },
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name']
                }
            ],
            limit: 6,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products',
            error: error.message
        });
    }
};

// @desc    Create product (Admin only)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category_id,
            image_url,
            is_available,
            customizations
        } = req.body;

        // Create product
        const product = await Product.create({
            name,
            description,
            price,
            category_id,
            image_url: image_url || '/images/default-product.jpg',
            is_available: is_available !== undefined ? is_available : true
        });

        // Create customization options if provided
        if (customizations && customizations.length > 0) {
            await Promise.all(customizations.map(opt =>
                CustomizationOption.create({
                    ...opt,
                    product_id: product.id
                })
            ));
        }

        // Fetch complete product with customizations
        const completeProduct = await Product.findByPk(product.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: CustomizationOption,
                    as: 'customizations'
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: completeProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// @desc    Update product (Admin only)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await product.update(req.body);

        res.json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await product.destroy();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: Product,
                as: 'products',
                where: { is_available: true },
                required: false
            }]
        });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
};