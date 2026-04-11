const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Driver = sequelize.define('Driver', {
 id: {
  type: DataTypes.INTEGER,
  primaryKey: true,
  autoIncrement: true
 },
 user_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  unique: true,
  references: {
   model: 'users',
   key: 'id'
  }
 },
 vehicle_type: {
  type: DataTypes.ENUM('bike', 'scooter', 'car'),
  defaultValue: 'scooter'
 },
 license_number: {
  type: DataTypes.STRING(50)
 },
 status: {
  type: DataTypes.ENUM('available', 'delivering', 'offline', 'on_break'),
  defaultValue: 'offline'
 },
 current_latitude: {
  type: DataTypes.DECIMAL(10, 8)
 },
 current_longitude: {
  type: DataTypes.DECIMAL(11, 8)
 },
 last_location_update: {
  type: DataTypes.DATE
 },
 average_delivery_time: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
  comment: 'Average delivery time in minutes'
 },
 total_deliveries: {
  type: DataTypes.INTEGER,
  defaultValue: 0
 },
 total_distance: {
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0,
  comment: 'Total distance traveled in kilometers'
 },
 rating: {
  type: DataTypes.DECIMAL(3, 2),
  defaultValue: 5.00
 },
 total_ratings: {
  type: DataTypes.INTEGER,
  defaultValue: 0
 },
 on_time_delivery_rate: {
  type: DataTypes.DECIMAL(5, 2),
  defaultValue: 100.00,
  comment: 'Percentage of on-time deliveries'
 },
 current_orders_count: {
  type: DataTypes.INTEGER,
  defaultValue: 0
 },
 shift_start: {
  type: DataTypes.DATE
 },
 shift_end: {
  type: DataTypes.DATE
 },
 is_active: {
  type: DataTypes.BOOLEAN,
  defaultValue: true
 },
 notes: {
  type: DataTypes.TEXT
 }
}, {
 tableName: 'drivers',
 timestamps: true,
 createdAt: 'created_at',
 updatedAt: 'updated_at'
});

module.exports = Driver;
