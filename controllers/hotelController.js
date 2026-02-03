const db = require('../config/database');

const getAllHotels = async (req, res) => {
    try {
        const { location, min_price, max_price, rating } = req.query;
        
        let query = 'SELECT * FROM hotel WHERE status = "active"';
        let params = [];

        if (location) {
            query += ' AND location LIKE ?';
            params.push(`%${location}%`);
        }

        if (min_price) {
            query += ' AND price_per_night >= ?';
            params.push(parseFloat(min_price));
        }

        if (max_price) {
            query += ' AND price_per_night <= ?';
            params.push(parseFloat(max_price));
        }

        if (rating) {
            query += ' AND rating >= ?';
            params.push(parseFloat(rating));
        }

        query += ' ORDER BY rating DESC, created_at DESC';

        const [hotels] = await db.execute(query, params);

        res.json({
            success: true,
            data: {
                hotels,
                count: hotels.length
            }
        });
    } catch (error) {
        console.error('Get hotels error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getHotelById = async (req, res) => {
    try {
        const { id } = req.params;

        const [hotels] = await db.execute(
            'SELECT * FROM hotel WHERE hotel_id = ?',
            [id]
        );

        if (hotels.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        res.json({
            success: true,
            data: {
                hotel: hotels[0]
            }
        });
    } catch (error) {
        console.error('Get hotel error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const bookHotel = async (req, res) => {
    try {
        const {
            hotel_id,
            customer_name,
            customer_email,
            customer_phone,
            check_in_date,
            check_out_date,
            number_of_rooms,
            number_of_guests
        } = req.body;
        const customerId = req.user.customer_id;

        // Get hotel details
        const [hotels] = await db.execute(
            'SELECT * FROM hotel WHERE hotel_id = ?',
            [hotel_id]
        );

        if (hotels.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        const hotel = hotels[0];

        // Calculate number of nights
        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date'
            });
        }

        const totalAmount = hotel.price_per_night * number_of_rooms * nights;

        // Create booking with confirmed status
        const [result] = await db.execute(
            'INSERT INTO hotel_booking (customer_id, hotel_id, customer_name, customer_email, customer_phone, check_in_date, check_out_date, number_of_rooms, number_of_guests, total_amount, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customerId, hotel_id, customer_name, customer_email, customer_phone, check_in_date, check_out_date, number_of_rooms, number_of_guests, totalAmount, 'confirmed', 'paid']
        );

        res.status(201).json({
            success: true,
            message: 'Hotel booked successfully',
            data: {
                booking: {
                    booking_id: result.insertId,
                    hotel_id,
                    customer_name,
                    customer_email,
                    customer_phone,
                    check_in_date,
                    check_out_date,
                    number_of_rooms,
                    number_of_guests,
                    total_amount: totalAmount,
                    nights,
                    status: 'confirmed',
                    payment_status: 'paid'
                }
            }
        });
    } catch (error) {
        console.error('Book hotel error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getUserHotelBookings = async (req, res) => {
    try {
        const customerId = req.user.customer_id;

        const [bookings] = await db.execute(`
            SELECT 
                hb.*,
                h.name as hotel_name,
                h.location,
                h.rating,
                h.price_per_night,
                DATEDIFF(hb.check_out_date, hb.check_in_date) as nights
            FROM hotel_booking hb
            JOIN hotel h ON hb.hotel_id = h.hotel_id
            WHERE hb.customer_id = ?
            ORDER BY hb.created_at DESC
        `, [customerId]);

        res.json({
            success: true,
            data: {
                bookings,
                count: bookings.length
            }
        });
    } catch (error) {
        console.error('Get user hotel bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getHotelBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.customer_id;

        const [bookings] = await db.execute(`
            SELECT 
                hb.*,
                h.name as hotel_name,
                h.location,
                h.description,
                h.rating,
                h.amenities,
                h.price_per_night,
                DATEDIFF(hb.check_out_date, hb.check_in_date) as nights
            FROM hotel_booking hb
            JOIN hotel h ON hb.hotel_id = h.hotel_id
            WHERE hb.booking_id = ? AND hb.customer_id = ?
        `, [id, customerId]);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hotel booking not found'
            });
        }

        res.json({
            success: true,
            data: {
                booking: bookings[0]
            }
        });
    } catch (error) {
        console.error('Get hotel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const cancelHotelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.customer_id;

        // Check if booking exists and belongs to user
        const [bookings] = await db.execute(
            'SELECT * FROM hotel_booking WHERE booking_id = ? AND customer_id = ?',
            [id, customerId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hotel booking not found'
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
            'UPDATE hotel_booking SET status = ? WHERE booking_id = ?',
            ['cancelled', id]
        );

        res.json({
            success: true,
            message: 'Hotel booking cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel hotel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllHotels,
    getHotelById,
    bookHotel,
    getUserHotelBookings,
    getHotelBookingById,
    cancelHotelBooking
};
