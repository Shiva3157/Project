const express = require('express');
const router = express.Router();
const { authenticateAgent, authenticateCustomer } = require('../middleware/auth');
const {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAgentVehicles,
    bookVehicle
} = require('../controllers/vehicleController');

// Public routes
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Customer routes
router.post('/book', authenticateCustomer, bookVehicle);

// Agent routes
router.get('/agent/my', authenticateAgent, getAgentVehicles);
router.post('/agent', authenticateAgent, createVehicle);
router.put('/agent/:id', authenticateAgent, updateVehicle);
router.delete('/agent/:id', authenticateAgent, deleteVehicle);

module.exports = router;
