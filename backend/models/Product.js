// backend/models/Product.js
const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING,
        defaultValue: '/images/default-product.jpg'
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    preparation_time: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 15
    },
    calories: {
        type: DataTypes.INTEGER
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0
    },
    order_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Product;