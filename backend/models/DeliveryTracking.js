// backend/models/DeliveryTracking.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryTracking = sequelize.define('DeliveryTracking', {
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location_lat: {
        type: DataTypes.DECIMAL(10, 8)
    },
    location_lng: {
        type: DataTypes.DECIMAL(11, 8)
    },
    notes: {
        type: DataTypes.TEXT
    },
    photo_url: {
        type: DataTypes.STRING
    },
    updated_by: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'delivery_tracking',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = DeliveryTracking;