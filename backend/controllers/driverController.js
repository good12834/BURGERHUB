const { Driver, User, Order } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all drivers
// @route   GET /api/admin/drivers
// @access  Private/Admin
const getAllDrivers = async (req, res) => {
 try {
  const {
   status,
   search,
   page = 1,
   limit = 20
  } = req.query;

  const whereConditions = {};

  if (status) {
   whereConditions.status = status;
  }

  const offset = (page - 1) * limit;

  const drivers = await Driver.findAndCountAll({
   where: whereConditions,
   include: [
    {
     model: User,
     as: 'user',
     attributes: { exclude: ['password'] },
     where: search ? {
      [Op.or]: [
       { name: { [Op.like]: `%${search}%` } },
       { email: { [Op.like]: `%${search}%` } }
      ]
     } : undefined
    }
   ],
   order: [['created_at', 'DESC']],
   limit: parseInt(limit),
   offset: parseInt(offset)
  });

  res.json({
   success: true,
   data: {
    drivers: drivers.rows,
    total: drivers.count,
    page: parseInt(page),
    totalPages: Math.ceil(drivers.count / limit)
   }
  });
 } catch (error) {
  console.error('Get all drivers error:', error);
  res.status(500).json({
   success: false,
   message: 'Error fetching drivers',
   error: error.message
  });
 }
};

// @desc    Get single driver
// @route   GET /api/admin/drivers/:id
// @access  Private/Admin
const getDriver = async (req, res) => {
 try {
  const driver = await Driver.findByPk(req.params.id, {
   include: [
    {
     model: User,
     as: 'user',
     attributes: { exclude: ['password'] }
    },
    {
     model: Order,
     as: 'orders',
     limit: 10,
     order: [['created_at', 'DESC']]
    }
   ]
  });

  if (!driver) {
   return res.status(404).json({
    success: false,
    message: 'Driver not found'
   });
  }

  res.json({
   success: true,
   data: driver
  });
 } catch (error) {
  console.error('Get driver error:', error);
  res.status(500).json({
   success: false,
   message: 'Error fetching driver',
   error: error.message
  });
 }
};

// @desc    Create driver
// @route   POST /api/admin/drivers
// @access  Private/Admin
const createDriver = async (req, res) => {
 try {
  const {
   user_id,
   vehicle_type,
   license_number,
   notes
  } = req.body;

  // Check if user exists
  const user = await User.findByPk(user_id);
  if (!user) {
   return res.status(404).json({
    success: false,
    message: 'User not found'
   });
  }

  // Check if user is already a driver
  const existingDriver = await Driver.findOne({ where: { user_id } });
  if (existingDriver) {
   return res.status(400).json({
    success: false,
    message: 'User is already a driver'
   });
  }

  // Update user role to delivery
  await user.update({ role: 'delivery' });

  // Create driver profile
  const driver = await Driver.create({
   user_id,
   vehicle_type: vehicle_type || 'scooter',
   license_number,
   notes
  });

  // Fetch driver with user data
  const driverWithUser = await Driver.findByPk(driver.id, {
   include: [
    {
     model: User,
     as: 'user',
     attributes: { exclude: ['password'] }
    }
   ]
  });

  res.status(201).json({
   success: true,
   message: 'Driver created successfully',
   data: driverWithUser
  });
 } catch (error) {
  console.error('Create driver error:', error);
  res.status(500).json({
   success: false,
   message: 'Error creating driver',
   error: error.message
  });
 }
};

// @desc    Update driver
// @route   PUT /api/admin/drivers/:id
// @access  Private/Admin
const updateDriver = async (req, res) => {
 try {
  const driver = await Driver.findByPk(req.params.id);

  if (!driver) {
   return res.status(404).json({
    success: false,
    message: 'Driver not found'
   });
  }

  const {
   vehicle_type,
   license_number,
   status,
   is_active,
   notes
  } = req.body;

  await driver.update({
   vehicle_type: vehicle_type || driver.vehicle_type,
   license_number: license_number !== undefined ? license_number : driver.license_number,
   status: status || driver.status,
   is_active: is_active !== undefined ? is_active : driver.is_active,
   notes: notes !== undefined ? notes : driver.notes
  });

  // Fetch updated driver with user data
  const updatedDriver = await Driver.findByPk(driver.id, {
   include: [
    {
     model: User,
     as: 'user',
     attributes: { exclude: ['password'] }
    }
   ]
  });

  res.json({
   success: true,
   message: 'Driver updated successfully',
   data: updatedDriver
  });
 } catch (error) {
  console.error('Update driver error:', error);
  res.status(500).json({
   success: false,
   message: 'Error updating driver',
   error: error.message
  });
 }
};

// @desc    Delete driver
// @route   DELETE /api/admin/drivers/:id
// @access  Private/Admin
const deleteDriver = async (req, res) => {
 try {
  const driver = await Driver.findByPk(req.params.id);

  if (!driver) {
   return res.status(404).json({
    success: false,
    message: 'Driver not found'
   });
  }

  // Update user role back to customer
  const user = await User.findByPk(driver.user_id);
  if (user) {
   await user.update({ role: 'customer' });
  }

  await driver.destroy();

  res.json({
   success: true,
   message: 'Driver deleted successfully'
  });
 } catch (error) {
  console.error('Delete driver error:', error);
  res.status(500).json({
   success: false,
   message: 'Error deleting driver',
   error: error.message
  });
 }
};

// @desc    Update driver location
// @route   PUT /api/admin/drivers/:id/location
// @access  Private/Admin
const updateDriverLocation = async (req, res) => {
 try {
  const driver = await Driver.findByPk(req.params.id);

  if (!driver) {
   return res.status(404).json({
    success: false,
    message: 'Driver not found'
   });
  }

  const { latitude, longitude } = req.body;

  await driver.update({
   current_latitude: latitude,
   current_longitude: longitude,
   last_location_update: new Date()
  });

  res.json({
   success: true,
   message: 'Driver location updated successfully',
   data: {
    id: driver.id,
    current_latitude: driver.current_latitude,
    current_longitude: driver.current_longitude,
    last_location_update: driver.last_location_update
   }
  });
 } catch (error) {
  console.error('Update driver location error:', error);
  res.status(500).json({
   success: false,
   message: 'Error updating driver location',
   error: error.message
  });
 }
};

// @desc    Get driver statistics
// @route   GET /api/admin/drivers/stats
// @access  Private/Admin
const getDriverStats = async (req, res) => {
 try {
  const totalDrivers = await Driver.count();
  const activeDrivers = await Driver.count({ where: { is_active: true } });
  const availableDrivers = await Driver.count({ where: { status: 'available', is_active: true } });
  const deliveringDrivers = await Driver.count({ where: { status: 'delivering' } });
  const offlineDrivers = await Driver.count({ where: { status: 'offline' } });

  // Calculate average metrics
  const drivers = await Driver.findAll({
   where: { is_active: true },
   attributes: ['average_delivery_time', 'rating', 'on_time_delivery_rate', 'total_deliveries']
  });

  const avgDeliveryTime = drivers.length > 0
   ? drivers.reduce((sum, d) => sum + d.average_delivery_time, 0) / drivers.length
   : 0;

  const avgRating = drivers.length > 0
   ? drivers.reduce((sum, d) => sum + parseFloat(d.rating), 0) / drivers.length
   : 0;

  const avgOnTimeRate = drivers.length > 0
   ? drivers.reduce((sum, d) => sum + parseFloat(d.on_time_delivery_rate), 0) / drivers.length
   : 0;

  const totalDeliveries = drivers.reduce((sum, d) => sum + d.total_deliveries, 0);

  res.json({
   success: true,
   data: {
    totalDrivers,
    activeDrivers,
    availableDrivers,
    deliveringDrivers,
    offlineDrivers,
    avgDeliveryTime: Math.round(avgDeliveryTime),
    avgRating: parseFloat(avgRating.toFixed(2)),
    avgOnTimeRate: parseFloat(avgOnTimeRate.toFixed(2)),
    totalDeliveries
   }
  });
 } catch (error) {
  console.error('Get driver stats error:', error);
  res.status(500).json({
   success: false,
   message: 'Error fetching driver statistics',
   error: error.message
  });
 }
};

// @desc    Assign order to driver
// @route   POST /api/admin/drivers/:id/assign-order
// @access  Private/Admin
const assignOrder = async (req, res) => {
 try {
  const driver = await Driver.findByPk(req.params.id);

  if (!driver) {
   return res.status(404).json({
    success: false,
    message: 'Driver not found'
   });
  }

  if (driver.status !== 'available') {
   return res.status(400).json({
    success: false,
    message: 'Driver is not available for order assignment'
   });
  }

  const { order_id } = req.body;

  const order = await Order.findByPk(order_id);
  if (!order) {
   return res.status(404).json({
    success: false,
    message: 'Order not found'
   });
  }

  // Update order with driver
  await order.update({
   delivery_person_id: driver.user_id,
   status: 'out_for_delivery'
  });

  // Update driver status and order count
  await driver.update({
   status: 'delivering',
   current_orders_count: driver.current_orders_count + 1
  });

  res.json({
   success: true,
   message: 'Order assigned to driver successfully',
   data: {
    driver_id: driver.id,
    order_id: order.id,
    driver_status: driver.status,
    current_orders_count: driver.current_orders_count
   }
  });
 } catch (error) {
  console.error('Assign order error:', error);
  res.status(500).json({
   success: false,
   message: 'Error assigning order to driver',
   error: error.message
  });
 }
};

module.exports = {
 getAllDrivers,
 getDriver,
 createDriver,
 updateDriver,
 deleteDriver,
 updateDriverLocation,
 getDriverStats,
 assignOrder
};
