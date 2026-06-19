const sequelize = require('./config/database');
const Category = require('./models/Category');
const Product = require('./models/Product');

const categories = [
  { name: 'Burgers', description: 'Juicy hand-made burgers' },
  { name: 'Sides', description: 'Crispy fries and delicious sides' },
  { name: 'Drinks', description: 'Refreshing drinks and shakes' },
  { name: 'Desserts', description: 'Sweet treats to end your meal' },
  { name: 'Combos', description: 'Value-packed meal deals' }
];

const products = [
  { name: 'Classic Cheeseburger', description: 'Juicy beef patty with melted cheese, lettuce, tomato, and our special sauce', price: 9.99, categoryName: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' },
  { name: 'Double Burger', description: 'Two juicy beef patties with cheese, bacon, and all the fixings', price: 12.99, categoryName: 'Burgers', image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop' },
  { name: 'Bacon Deluxe', description: 'Beef patty with crispy bacon, cheese, and caramelized onions', price: 11.99, categoryName: 'Burgers', image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop' },
  { name: 'Crispy Chicken', description: 'Crispy fried chicken breast with pickles and mayo', price: 10.99, categoryName: 'Burgers', image_url: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=800&auto=format&fit=crop' },
  { name: 'Grilled Chicken', description: 'Tender grilled chicken breast with fresh herbs', price: 11.49, categoryName: 'Burgers', image_url: 'https://images.unsplash.com/photo-1610393710041-99882476bbed?q=80&w=800&auto=format&fit=crop' },
  { name: 'Veggie Delight', description: 'Plant-based patty with fresh veggies and herb mayo', price: 10.99, categoryName: 'Burgers', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop' },
  { name: 'Mushroom Swiss', description: 'Beef patty with sauteed mushrooms and swiss cheese', price: 12.49, categoryName: 'Burgers', image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=800&auto=format&fit=crop' },
  { name: 'French Fries', description: 'Golden crispy fries with sea salt', price: 4.99, categoryName: 'Sides', image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop' },
  { name: 'Onion Rings', description: 'Beer-battered onion rings', price: 5.99, categoryName: 'Sides', image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=800&auto=format&fit=crop' },
  { name: 'Sweet Potato Fries', description: 'Crispy sweet potato fries with cinnamon sugar', price: 5.99, categoryName: 'Sides', image_url: 'https://images.unsplash.com/photo-1600271886399-dc81dcb0b2bc?q=80&w=800&auto=format&fit=crop' },
  { name: 'Soft Drink', description: 'Classic cola drink', price: 2.99, categoryName: 'Drinks', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop' },
  { name: 'Milkshake', description: 'Creamy vanilla milkshake', price: 4.99, categoryName: 'Drinks', image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop' },
  { name: 'Fresh Lemonade', description: 'Fresh squeezed lemonade', price: 3.99, categoryName: 'Drinks', image_url: 'https://images.unsplash.com/photo-1523633513743-bc9768689551?q=80&w=800&auto=format&fit=crop' },
  { name: 'Chocolate Brownie', description: 'Rich chocolate brownie with vanilla ice cream', price: 6.99, categoryName: 'Desserts', image_url: 'https://images.unsplash.com/photo-1624353365286-3f062f74ff1c?q=80&w=800&auto=format&fit=crop' },
  { name: 'Apple Pie', description: 'Warm apple pie with cinnamon', price: 5.99, categoryName: 'Desserts', image_url: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Burger Combo', description: 'Classic cheeseburger with fries and a drink', price: 14.99, categoryName: 'Combos', image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop' },
  { name: 'Family Pack', description: '4 burgers, 2 fries, 2 drinks - perfect for the family', price: 39.99, categoryName: 'Combos', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' }
];

async function seedDatabase() {
  try {
    const productCount = await Product.count();
    if (productCount > 0) {
      console.log('✅ Database already seeded');
      return;
    }

    console.log('🌱 Seeding database...');

    for (const cat of categories) {
      await Category.findOrCreate({ where: { name: cat.name }, defaults: cat });
    }

    for (const prod of products) {
      const category = await Category.findOne({ where: { name: prod.categoryName } });
      await Product.findOrCreate({
        where: { name: prod.name },
        defaults: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          category_id: category ? category.id : null,
          image_url: prod.image_url,
          is_available: true
        }
      });
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
}

module.exports = seedDatabase;
