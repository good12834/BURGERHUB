// backend/seed_orders.js
const sequelize = require('./config/database');
require('./models'); // This sets up all associations
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Product = require('./models/Product');
const User = require('./models/User');

async function seedOrders() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get a customer user
    const user = await User.findOne({ where: { role: 'customer' } });
    if (!user) {
      console.log('No customer user found');
      return;
    }
    console.log('Using user:', user.id, user.name);

    // Get some products
    const products = await Product.findAll({ limit: 3 });
    if (products.length < 1) {
      console.log('No products found');
      return;
    }

    // Create order
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD${year}${month}${day}${random}`;

    const order = await Order.create({
      order_number: orderNumber,
      user_id: user.id,
      total_amount: 15.99,
      subtotal: 13.99,
      delivery_fee: 2.00,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'stripe',
      delivery_address: '123 Main St, Tel Aviv',
      delivery_instructions: 'Ring doorbell twice',
      estimated_delivery_time: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: user.phone || '+972 50-123-4567'
    });

    console.log('✅ Order created:', order.order_number);

    // Create order items
    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      await OrderItem.create({
        order_id: order.id,
        product_id: prod.id,
        product_name: prod.name,
        quantity: 1,
        unit_price: prod.price,
        total_price: prod.price,
        customizations: i === 0 ? { addons: ['extra cheese'] } : {}
      });
    }

    console.log('✅ Order items created');

    console.log('🎉 Sample order seeded successfully!');
    console.log('Order number:', order.order_number);
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedOrders();