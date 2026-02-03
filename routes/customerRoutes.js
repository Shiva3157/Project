const express = require('express');
const router = express.Router();
const { authenticateCustomer } = require('../middleware/auth');
const {
    customerRegister,
    customerLogin,
    getCustomerProfile,
    updateCustomerProfile,
    changeCustomerPassword,
    getCustomerBookings
} = require('../controllers/customerController');

// Public routes
router.post('/register', customerRegister);
router.post('/login', customerLogin);

// Protected customer routes
router.use(authenticateCustomer);
router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);
router.put('/change-password', changeCustomerPassword);
router.get('/bookings', getCustomerBookings);

module.exports = router;
