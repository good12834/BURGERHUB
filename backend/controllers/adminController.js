const { Order, User, Product, OrderItem } = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');
// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

      const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        const thisMonth = new Date(today);
        thisMonth.setMonth(thisMonth.getMonth() - 1);

        // Basic stats
        const totalOrders = await Order.count();
        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalProducts = await Product.count();
        const pendingOrders = await Order.count({ where: { status: 'pending' } });
        
        // Today's stats
        const todayOrders = await Order.count({
            where: {
                created_at: {
                    [Op.gte]: today
                }
            }
        });

        const todayRevenue = await Order.sum('total_amount', {
            where: {
                payment_status: 'paid',
                created_at: {
                    [Op.gte]: today
                }
            }
        });

        // Revenue stats
        const totalRevenue = await Order.sum('total_amount', {
            where: { payment_status: 'paid' }
        });

        const weeklyRevenue = await Order.sum('total_amount', {
            where: {
                payment_status: 'paid',
                created_at: {
                    [Op.gte]: thisWeek
                }
            }
        });

        const monthlyRevenue = await Order.sum('total_amount', {
            where: {
                payment_status: 'paid',
                created_at: {
                    [Op.gte]: thisMonth
                }
            }
        });

        // Order status distribution
        const orderStatusCounts = await Order.findAll({
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
            ],
            group: ['status']
        });

        // Payment status distribution
        const paymentStatusCounts = await Order.findAll({
            attributes: [
                'payment_status',
                [Sequelize.fn('COUNT', Sequelize.col('payment_status')), 'count']
            ],
            group: ['payment_status']
        });

        // Recent orders
        const recentOrders = await Order.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        // Top selling products
        const topProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                'product_name',
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity'],
                [Sequelize.fn('SUM', Sequelize.col('total_price')), 'total_revenue']
            ],
            group: ['product_id', 'product_name'],
            order: [[Sequelize.literal('total_quantity'), 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalOrders,
                    totalUsers,
                    totalProducts,
                    totalRevenue: totalRevenue || 0,
                    pendingOrders,
                    todayOrders,
                    todayRevenue: todayRevenue || 0,
                    weeklyRevenue: weeklyRevenue || 0,
                    monthlyRevenue: monthlyRevenue || 0
                },
                orderStatusDistribution: orderStatusCounts,
                paymentStatusDistribution: paymentStatusCounts,
                recentOrders,
                topProducts
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching dashboard stats', 
            error: error.message 
        });
    }
};

// @desc    Get all orders (with filters)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const { 
            status, 
            payment_status, 
            start_date, 
            end_date,
            search,
            page = 1, 
            limit = 20 
        } = req.query;

        const whereConditions = {};

        if (status) {
            whereConditions.status = status;
        }

        if (payment_status) {
            whereConditions.payment_status = payment_status;
        }

        if (start_date || end_date) {
            whereConditions.created_at = {};
            if (start_date) {
                whereConditions.created_at[Op.gte] = new Date(start_date);
            }
            if (end_date) {
                whereConditions.created_at[Op.lte] = new Date(end_date);
            }
        }

        const offset = (page - 1) * limit;

        const orders = await Order.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone'],
                    where: search ? {
                        [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } }
                        ]
                    } : undefined
                },
                {
                    model: OrderItem,
                    as: 'items'
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                orders: orders.rows,
                total: orders.count,
                page: parseInt(page),
                totalPages: Math.ceil(orders.count / limit)
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching orders', 
            error: error.message 
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const { 
            role, 
            search,
            page = 1, 
            limit = 20 
        } = req.query;

        const whereConditions = {};

        if (role) {
            whereConditions.role = role;
        }

        if (search) {
            whereConditions[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const users = await User.findAndCountAll({
            where: whereConditions,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Get order count for each user
        const usersWithOrderCount = await Promise.all(
            users.rows.map(async (user) => {
                const orderCount = await Order.count({
                    where: { user_id: user.id }
                });
                return {
                    ...user.toJSON(),
                    orderCount
                };
            })
        );

        res.json({
            success: true,
            data: {
                users: usersWithOrderCount,
                total: users.count,
                page: parseInt(page),
                totalPages: Math.ceil(users.count / limit)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users', 
            error: error.message 
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['customer', 'admin', 'delivery'].includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role' 
            });
        }

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Prevent admin from changing their own role
        if (user.id === req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot change your own role' 
            });
        }

        await user.update({ role });

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating user role', 
            error: error.message 
        });
    }
};

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
const getSalesReport = async (req, res) => {
    try {
        const { start_date, end_date, group_by = 'day' } = req.query;

        const startDate = start_date ? new Date(start_date) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end_date ? new Date(end_date) : new Date();

        let groupFormat;
        switch(group_by) {
            case 'hour':
                groupFormat = '%Y-%m-%d %H:00:00';
                break;
            case 'day':
                groupFormat = '%Y-%m-%d';
                break;
            case 'week':
                groupFormat = '%Y-%u';
                break;
            case 'month':
                groupFormat = '%Y-%m';
                break;
            default:
                groupFormat = '%Y-%m-%d';
        }

        const salesData = await Order.findAll({
            attributes: [
                [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), groupFormat), 'period'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'order_count'],
                [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total_revenue'],
                [Sequelize.fn('AVG', Sequelize.col('total_amount')), 'average_order_value']
            ],
            where: {
                payment_status: 'paid',
                created_at: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['period'],
            order: [[Sequelize.literal('period'), 'ASC']]
        });

        // Get product sales breakdown
        const productSales = await OrderItem.findAll({
            attributes: [
                'product_id',
                'product_name',
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity'],
                [Sequelize.fn('SUM', Sequelize.col('total_price')), 'total_revenue']
            ],
            include: [{
                model: Order,
                where: {
                    payment_status: 'paid',
                    created_at: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                attributes: []
            }],
            group: ['product_id', 'product_name'],
            order: [[Sequelize.literal('total_revenue'), 'DESC']]
        });

        res.json({
            success: true,
            data: {
                period: {
                    start: startDate,
                    end: endDate,
                    group_by
                },
                sales_overview: salesData,
                product_sales: productSales,
                summary: {
                    total_orders: salesData.reduce((sum, item) => sum + parseInt(item.dataValues.order_count), 0),
                    total_revenue: salesData.reduce((sum, item) => sum + parseFloat(item.dataValues.total_revenue || 0), 0),
                    average_order: salesData.reduce((sum, item) => sum + parseFloat(item.dataValues.average_order_value || 0), 0) / salesData.length
                }
            }
        });
    } catch (error) {
        console.error('Sales report error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error generating sales report', 
            error: error.message 
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllOrders,
    getAllUsers,
    updateUserRole,
    getSalesReport
};