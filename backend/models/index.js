const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const DeliveryTracking = require('./DeliveryTracking');
const CustomizationOption = require('./CustomizationOption');
const Driver = require('./Driver');

// Relationships
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

Product.hasMany(CustomizationOption, { foreignKey: 'product_id', as: 'customizations' });
CustomizationOption.belongsTo(Product, { foreignKey: 'product_id' });

Order.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasMany(DeliveryTracking, { foreignKey: 'order_id', as: 'tracking' });
DeliveryTracking.belongsTo(Order, { foreignKey: 'order_id' });
DeliveryTracking.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

// Driver relationships
Driver.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Driver, { foreignKey: 'user_id', as: 'driver' });

Order.belongsTo(Driver, { foreignKey: 'delivery_person_id', as: 'driver' });
Driver.hasMany(Order, { foreignKey: 'delivery_person_id', as: 'orders' });

module.exports = {
    User,
    Product,
    Category,
    Order,
    OrderItem,
    DeliveryTracking,
    CustomizationOption,
    Driver
};