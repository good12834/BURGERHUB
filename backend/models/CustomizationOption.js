// backend/models/CustomizationOption.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomizationOption = sequelize.define('CustomizationOption', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('single', 'multiple', 'extra'),
        defaultValue: 'single'
    },
    options: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    price_adjustment: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    max_selections: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    tableName: 'customization_options',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CustomizationOption;