const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
 user_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
   model: 'users',
   key: 'id'
  },
  onDelete: 'CASCADE'
 },
 product_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
   model: 'products',
   key: 'id'
  },
  onDelete: 'CASCADE'
 }
}, {
 tableName: 'favorites',
 timestamps: true,
 createdAt: 'created_at',
 updatedAt: 'updated_at',
 indexes: [
  {
   unique: true,
   fields: ['user_id', 'product_id']
  }
 ]
});

module.exports = Favorite;
