const { Product, Category } = require('./models');
const sequelize = require('./config/database');

const UPDATES = [
    { name: "Classic Cheeseburger", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop" },
    { name: "Double Burger", img: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop" },
    { name: "Bacon Deluxe", img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop" },
    { name: "Crispy Chicken", img: "https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=800&auto=format&fit=crop" },
    { name: "Grilled Chicken", img: "https://images.unsplash.com/photo-1610393710041-99882476bbed?q=80&w=800&auto=format&fit=crop" },
    { name: "Veggie Delight", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop" },
    { name: "Mushroom Swiss", img: "https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=800&auto=format&fit=crop" },
    { name: "French Fries", img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop" },
    { name: "Onion Rings", img: "https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=800&auto=format&fit=crop" },
    { name: "Sweet Potato Fries", img: "https://images.unsplash.com/photo-1600271886399-dc81dcb0b2bc?q=80&w=800&auto=format&fit=crop" },
    { name: "Soft Drink", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop" },
    { name: "Milkshake", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop" },
    { name: "Fresh Lemonade", img: "https://images.unsplash.com/photo-1523633513743-bc9768689551?q=80&w=800&auto=format&fit=crop" },
    { name: "Chocolate Brownie", img: "https://images.unsplash.com/photo-1624353365286-3f062f74ff1c?q=80&w=800&auto=format&fit=crop" },
    { name: "Apple Pie", img: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?q=80&w=800&auto=format&fit=crop" }
];

async function updateProducts() {
    try {
        await sequelize.authenticate();
        
        // Update category name
        await Category.update({ name: 'Drinks' }, { where: { name: 'Beverages' } });
        console.log('✅ "Beverages" renamed to "Drinks"');

        for (const up of UPDATES) {
            const [affectedRows] = await Product.update(
                { image_url: up.img },
                { where: { name: up.name } }
            );
            if (affectedRows > 0) {
                console.log(`✅ Updated image for: ${up.name}`);
            } else {
                console.warn(`⚠️ Product not found: ${up.name}`);
            }
        }
    } catch (error) {
        console.error('❌ Update failed:', error);
    } finally {
        await sequelize.close();
    }
}

updateProducts();
