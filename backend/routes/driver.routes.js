const express = require('express');
const router = express.Router();
const {
 getAllDrivers,
 getDriver,
 createDriver,
 updateDriver,
 deleteDriver,
 updateDriverLocation,
 getDriverStats,
 assignOrder
} = require('../controllers/driverController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

router.get('/stats', getDriverStats);
router.get('/', getAllDrivers);
router.get('/:id', getDriver);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);
router.put('/:id/location', updateDriverLocation);
router.post('/:id/assign-order', assignOrder);

module.exports = router;
