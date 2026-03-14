// backend/models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  order_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  coupon_code: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.ENUM('stripe', 'cash', 'card'),
    defaultValue: 'stripe'
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  delivery_instructions: {
    type: DataTypes.TEXT
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  customer_email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  estimated_delivery_time: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Generate order number before creation
Order.beforeCreate(async (order) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  order.order_number = `ORD${year}${month}${day}${random}`;
});

module.exports = Order;