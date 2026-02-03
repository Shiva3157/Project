const express = require('express');
const router = express.Router();
const { authenticateCustomer } = require('../middleware/auth');
const {
    getAllHotels,
    getHotelById,
    bookHotel,
    getUserHotelBookings,
    getHotelBookingById,
    cancelHotelBooking
} = require('../controllers/hotelController');

// Public routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Protected routes
router.post('/book', authenticateCustomer, bookHotel);
router.get('/bookings/my', authenticateCustomer, getUserHotelBookings);
router.get('/bookings/:id', authenticateCustomer, getHotelBookingById);
router.put('/bookings/:id/cancel', authenticateCustomer, cancelHotelBooking);

module.exports = router;
