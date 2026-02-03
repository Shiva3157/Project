const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const {
    adminLogin,
    createAgent,
    getAllAgents,
    updateAgent,
    deleteAgent,
    getDashboardStats
} = require('../controllers/adminController');

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.use(authenticateAdmin);
router.get('/dashboard', getDashboardStats);
router.post('/agents', createAgent);
router.get('/agents', getAllAgents);
router.put('/agents/:id', updateAgent);
router.delete('/agents/:id', deleteAgent);

module.exports = router;
