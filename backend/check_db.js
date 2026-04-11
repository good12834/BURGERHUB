const sequelize = require('./config/database');

async function checkTables() {
    try {
        const [results] = await sequelize.query("SHOW TABLES");
        console.log('Tables:', results.map(r => Object.values(r)[0]));

        const [orders] = await sequelize.query("SELECT COUNT(*) as count FROM orders");
        console.log('Orders count:', orders[0].count);

        if (orders[0].count > 0) {
            const [sample] = await sequelize.query("SELECT id, user_id, status FROM orders LIMIT 1");
            console.log('Sample order:', sample[0]);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkTables();