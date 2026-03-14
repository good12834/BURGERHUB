// backend/seed_products.js
const sequelize = require('./config/database');
require('./models'); // This sets up all associations
const Category = require('./models/Category');
const Product = require('./models/Product');

async function seedData() {
 try {
  // Connect to database
  await sequelize.authenticate();
  console.log('✅ Database connected');

  // Seed categories
  const categories = [
   { name: 'Burgers', description: 'Juicy hand-made burgers' },
   { name: 'Sides', description: 'Crispy fries and delicious sides' },
   { name: 'Beverages', description: 'Refreshing drinks and shakes' },
   { name: 'Desserts', description: 'Sweet treats to end your meal' },
   { name: 'Combos', description: 'Value-packed meal deals' }
  ];

  console.log('🌱 Seeding categories...');
  for (const cat of categories) {
   await Category.findOrCreate({
    where: { name: cat.name },
    defaults: cat
   });
  }
  console.log('✅ Categories seeded');

  // Get category IDs
  const burgersCat = await Category.findOne({ where: { name: 'Burgers' } });
  const sidesCat = await Category.findOne({ where: { name: 'Sides' } });
  const beveragesCat = await Category.findOne({ where: { name: 'Beverages' } });
  const dessertsCat = await Category.findOne({ where: { name: 'Desserts' } });
  const combosCat = await Category.findOne({ where: { name: 'Combos' } });

  // Seed products
  const products = [
   {
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with melted cheese, lettuce, tomato, and our special sauce',
    price: 9.99,
    category_id: burgersCat.id,
    image_url: '/images/products/classic-cheeseburger.jpg',
    is_available: true
   },
   {
    name: 'Double Burger',
    description: 'Two juicy beef patties with cheese, bacon, and all the fixings',
    price: 12.99,
    category_id: burgersCat.id,
    image_url: '/images/products/double-burger.jpg',
    is_available: true
   },
   {
    name: 'Bacon Deluxe',
    description: 'Beef patty with crispy bacon, cheese, and caramelized onions',
    price: 11.99,
    category_id: burgersCat.id,
    image_url: '/images/products/bacon-deluxe.jpg',
    is_available: true
   },
   {
    name: 'Veggie Delight',
    description: 'Plant-based patty with fresh veggies and herb mayo',
    price: 10.99,
    category_id: burgersCat.id,
    image_url: '/images/products/veggie-delight.jpg',
    is_available: true
   },
   {
    name: 'French Fries',
    description: 'Golden crispy fries with sea salt',
    price: 4.99,
    category_id: sidesCat.id,
    image_url: '/images/products/french-fries.jpg',
    is_available: true
   },
   {
    name: 'Sweet Potato Fries',
    description: 'Crispy sweet potato fries with cinnamon sugar',
    price: 5.99,
    category_id: sidesCat.id,
    image_url: '/images/products/sweet-potato-fries.jpg',
    is_available: true
   },
   {
    name: 'Onion Rings',
    description: 'Beer-battered onion rings',
    price: 5.99,
    category_id: sidesCat.id,
    image_url: '/images/products/onion-rings.jpg',
    is_available: true
   },
   {
    name: 'Cola',
    description: 'Classic cola drink',
    price: 2.99,
    category_id: beveragesCat.id,
    image_url: '/images/products/soft-drink.jpg',
    is_available: true
   },
   {
    name: 'Fresh Lemonade',
    description: 'Fresh squeezed lemonade',
    price: 3.99,
    category_id: beveragesCat.id,
    image_url: '/images/products/fresh-lemonade.jpg',
    is_available: true
   },
   {
    name: 'Milkshake',
    description: 'Creamy vanilla milkshake',
    price: 4.99,
    category_id: beveragesCat.id,
    image_url: '/images/products/milkshake.jpg',
    is_available: true
   },
   {
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with vanilla ice cream',
    price: 6.99,
    category_id: dessertsCat.id,
    image_url: '/images/products/chocolate-brownie.jpg',
    is_available: true
   },
   {
    name: 'Apple Pie',
    description: 'Warm apple pie with cinnamon',
    price: 5.99,
    category_id: dessertsCat.id,
    image_url: '/images/products/apple-pie.jpg',
    is_available: true
   }
  ];

  console.log('🌱 Seeding products...');
  for (const prod of products) {
   await Product.findOrCreate({
    where: { name: prod.name },
    defaults: prod
   });
  }
  console.log('✅ Products seeded');

  console.log('🎉 Database seeding completed successfully!');
  process.exit(0);

 } catch (error) {
  console.error('❌ Seeding error:', error);
  process.exit(1);
 }
}

seedData();