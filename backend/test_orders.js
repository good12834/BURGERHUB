const { Order, OrderItem } = require('./models');
const sequelize = require('./config/database');

async function testQuery() {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        const orders = await Order.findAll({
            where: { user_id: 1 }, // Assuming user id 1 exists
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    attributes: ['id', 'product_name', 'quantity', 'unit_price', 'total_price', 'customizations']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        console.log('Orders found:', orders.length);
        console.log('First order:', orders[0] ? {
            id: orders[0].id,
            status: orders[0].status,
            itemsCount: orders[0].items ? orders[0].items.length : 0
        } : 'No orders');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

testQuery();