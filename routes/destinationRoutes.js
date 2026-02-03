const express = require('express');
const router = express.Router();
const {
    getAllDestinations,
    getDestinationById,
    getPopularDestinations
} = require('../controllers/destinationController');

// All destination routes are public
router.get('/', getAllDestinations);
router.get('/popular', getPopularDestinations);
router.get('/:id', getDestinationById);

module.exports = router;
