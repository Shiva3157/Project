const express = require('express');
const router = express.Router();
const { authenticateAgent } = require('../middleware/auth');
const {
    agentLogin,
    getAgentProfile,
    updateAgentProfile,
    changeAgentPassword,
    getAgentDashboard
} = require('../controllers/agentController');

// Public routes
router.post('/login', agentLogin);

// Protected agent routes
router.use(authenticateAgent);
router.get('/profile', getAgentProfile);
router.put('/profile', updateAgentProfile);
router.put('/change-password', changeAgentPassword);
router.get('/dashboard', getAgentDashboard);

module.exports = router;
