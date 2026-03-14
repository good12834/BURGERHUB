const { Product, Category } = require('./models');
const sequelize = require('./config/database');

async function checkCounts() {
    try {
        await sequelize.authenticate();
        const categories = await Category.findAll({
            include: [{
                model: Product,
                as: 'products'
            }]
        });

        console.log('Category Counts:');
        categories.forEach(cat => {
            console.log(`${cat.name}: ${cat.products ? cat.products.length : 0}`);
        });

        const allProducts = await Product.findAll({
            include: [{ model: Category, as: 'category' }]
        });
        console.log('\nAll Products:');
        allProducts.forEach(p => {
            console.log(`- ${p.name} (${p.category ? p.category.name : 'No Category'})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkCounts();
