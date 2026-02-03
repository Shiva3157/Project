const db = require('../config/database');

const getAllDestinations = async (req, res) => {
    try {
        const { country, search } = req.query;
        
        let query = 'SELECT * FROM destinations WHERE 1=1';
        let params = [];

        if (country) {
            query += ' AND country LIKE ?';
            params.push(`%${country}%`);
        }

        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ? OR popular_attractions LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY name ASC';

        const [destinations] = await db.execute(query, params);

        res.json({
            success: true,
            data: {
                destinations,
                count: destinations.length
            }
        });
    } catch (error) {
        console.error('Get destinations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getDestinationById = async (req, res) => {
    try {
        const { id } = req.params;

        const [destinations] = await db.execute(
            'SELECT * FROM destinations WHERE destination_id = ?',
            [id]
        );

        if (destinations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found'
            });
        }

        // Get related packages for this destination
        const [packages] = await db.execute(
            'SELECT package_id, title, price, duration_days, image_url FROM package WHERE destination LIKE ? ORDER BY price ASC LIMIT 5',
            [`%${destinations[0].name}%`]
        );

        // Get related hotels for this destination
        const [hotels] = await db.execute(
            'SELECT hotel_id, name, price_per_night, rating, image_url FROM hotel WHERE location LIKE ? ORDER BY rating DESC LIMIT 5',
            [`%${destinations[0].name}%`]
        );

        res.json({
            success: true,
            data: {
                destination: destinations[0],
                related_packages: packages,
                related_hotels: hotels
            }
        });
    } catch (error) {
        console.error('Get destination error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getPopularDestinations = async (req, res) => {
    try {
        // Get destinations with most bookings
        const [destinations] = await db.execute(`
            SELECT 
                d.*,
                COUNT(b.booking_id) as package_bookings,
                0 as hotel_bookings,
                COUNT(b.booking_id) as total_bookings
            FROM destinations d
            LEFT JOIN package p ON d.name LIKE CONCAT('%', p.destination, '%')
            LEFT JOIN booking b ON p.package_id = b.package_id
            GROUP BY d.destination_id
            ORDER BY total_bookings DESC, d.name ASC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                destinations,
                count: destinations.length
            }
        });
    } catch (error) {
        console.error('Get popular destinations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllDestinations,
    getDestinationById,
    getPopularDestinations
};
