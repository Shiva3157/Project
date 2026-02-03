const express = require('express');
const router = express.Router();
const { authenticateCustomer, authenticateAgent } = require('../middleware/auth');
const {
    getAllPackages,
    getPackageById,
    bookPackage,
    getUserBookings,
    getBookingById,
    cancelBooking
} = require('../controllers/packageController');

// Public routes
router.get('/', getAllPackages);
router.get('/:id', getPackageById);

// Customer routes
router.post('/book', authenticateCustomer, bookPackage);
router.get('/bookings/my', authenticateCustomer, getUserBookings);
router.get('/bookings/:id', authenticateCustomer, getBookingById);
router.put('/bookings/:id/cancel', authenticateCustomer, cancelBooking);

// Agent routes (for managing packages)
// These would be implemented in a separate agent package controller
// router.post('/agent', authenticateAgent, createPackage);
// router.put('/agent/:id', authenticateAgent, updatePackage);
// router.delete('/agent/:id', authenticateAgent, deletePackage);

module.exports = router;
