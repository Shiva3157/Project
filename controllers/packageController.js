const db = require('../config/database');

const getAllPackages = async (req, res) => {
    try {
        const { destination, min_price, max_price, duration, start_location } = req.query;
        
        let query = `
            SELECT 
                p.*,
                a.name as agent_name,
                a.commission_rate
            FROM package p
            JOIN agent a ON p.agent_id = a.agent_id
            WHERE p.status = 'available' AND a.status = 'active'
        `;
        let params = [];

        if (destination) {
            query += ' AND p.destination LIKE ?';
            params.push(`%${destination}%`);
        }

        if (start_location) {
            query += ' AND p.start_location LIKE ?';
            params.push(`%${start_location}%`);
        }

        if (min_price) {
            query += ' AND p.price >= ?';
            params.push(parseFloat(min_price));
        }

        if (max_price) {
            query += ' AND p.price <= ?';
            params.push(parseFloat(max_price));
        }

        if (duration) {
            query += ' AND p.duration_days = ?';
            params.push(parseInt(duration));
        }

        query += ' ORDER BY p.created_at DESC';

        const [packages] = await db.execute(query, params);

        res.json({
            success: true,
            data: {
                packages,
                count: packages.length
            }
        });
    } catch (error) {
        console.error('Get packages error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;

        const [packages] = await db.execute(
            `SELECT 
                p.*,
                a.name as agent_name,
                a.phone as agent_phone,
                a.commission_rate
            FROM package p
            JOIN agent a ON p.agent_id = a.agent_id
            WHERE p.package_id = ? AND p.status = 'available'`,
            [id]
        );

        if (packages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        res.json({
            success: true,
            data: {
                package: packages[0]
            }
        });
    } catch (error) {
        console.error('Get package error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const bookPackage = async (req, res) => {
    try {
        const {
            package_id,
            travel_date,
            seats_booked = 1
        } = req.body;
        const customerId = req.user.customer_id;

        // Get package details
        const [packages] = await db.execute(
            'SELECT * FROM package WHERE package_id = ? AND status = "available"',
            [package_id]
        );

        if (packages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Package not found or not available'
            });
        }

        const packageData = packages[0];
        const totalAmount = packageData.price * seats_booked;

        // Create booking with confirmed status
        const [result] = await db.execute(
            'INSERT INTO booking (customer_id, package_id, travel_date, total_amount, seats_booked, status) VALUES (?, ?, ?, ?, ?, ?)',
            [customerId, package_id, travel_date, totalAmount, seats_booked, 'confirmed']
        );

        res.status(201).json({
            success: true,
            message: 'Package booked successfully',
            data: {
                booking: {
                    booking_id: result.insertId,
                    package_id,
                    travel_date,
                    total_amount: totalAmount,
                    seats_booked,
                    status: 'confirmed'
                }
            }
        });
    } catch (error) {
        console.error('Book package error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const customerId = req.user.customer_id;

        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                p.title as package_name,
                p.destination,
                p.duration_days
            FROM booking b
            JOIN package p ON b.package_id = p.package_id
            WHERE b.customer_id = ?
            ORDER BY b.created_at DESC
        `, [customerId]);

        res.json({
            success: true,
            data: {
                bookings,
                count: bookings.length
            }
        });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.customer_id;

        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                p.title as package_name,
                p.destination,
                p.duration_days,
                p.description,
                p.includes,
                p.excludes
            FROM booking b
            JOIN package p ON b.package_id = p.package_id
            WHERE b.booking_id = ? AND b.customer_id = ?
        `, [id, customerId]);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: {
                booking: bookings[0]
            }
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.customer_id;

        // Check if booking exists and belongs to user
        const [bookings] = await db.execute(
            'SELECT * FROM booking WHERE booking_id = ? AND customer_id = ?',
            [id, customerId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const booking = bookings[0];

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed booking'
            });
        }

        // Update booking status
        await db.execute(
            'UPDATE booking SET status = ? WHERE booking_id = ?',
            ['cancelled', id]
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllPackages,
    getPackageById,
    bookPackage,
    getUserBookings,
    getBookingById,
    cancelBooking
};
