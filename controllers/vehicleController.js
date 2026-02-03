const db = require('../config/database');

const getAllVehicles = async (req, res) => {
    try {
        const { source, destination, bus_type, departure_date } = req.query;
        
        let query = `
            SELECT 
                v.*,
                a.name as agent_name,
                a.commission_rate
            FROM vehicle v
            JOIN agent a ON v.agent_id = a.agent_id
            WHERE v.status = 'active' AND a.status = 'active'
        `;
        let params = [];

        if (source) {
            query += ' AND v.source LIKE ?';
            params.push(`%${source}%`);
        }

        if (destination) {
            query += ' AND v.destination LIKE ?';
            params.push(`%${destination}%`);
        }

        if (bus_type) {
            query += ' AND v.bus_type = ?';
            params.push(bus_type);
        }

        if (departure_date) {
            query += ' AND DATE(v.departure_time) = ?';
            params.push(departure_date);
        }

        query += ' ORDER BY v.departure_time ASC';

        const [vehicles] = await db.execute(query, params);

        res.json({
            success: true,
            data: {
                vehicles,
                count: vehicles.length
            }
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const [vehicles] = await db.execute(
            `SELECT 
                v.*,
                a.name as agent_name,
                a.phone as agent_phone,
                a.commission_rate
            FROM vehicle v
            JOIN agent a ON v.agent_id = a.agent_id
            WHERE v.bus_id = ? AND v.status = 'active'`,
            [id]
        );

        if (vehicles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            data: {
                vehicle: vehicles[0]
            }
        });
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const createVehicle = async (req, res) => {
    try {
        const {
            bus_number,
            bus_type,
            total_seats,
            source,
            destination,
            departure_time,
            arrival_time,
            fare_per_seat
        } = req.body;
        const agentId = req.user.agent_id;

        // Check if bus number already exists
        const [existingVehicles] = await db.execute(
            'SELECT bus_id FROM vehicle WHERE bus_number = ?',
            [bus_number]
        );

        if (existingVehicles.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bus number already exists'
            });
        }

        // Create vehicle
        const [result] = await db.execute(
            'INSERT INTO vehicle (agent_id, bus_number, bus_type, total_seats, available_seats, source, destination, departure_time, arrival_time, fare_per_seat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [agentId, bus_number, bus_type, total_seats, total_seats, source, destination, departure_time, arrival_time, fare_per_seat]
        );

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: {
                vehicle: {
                    bus_id: result.insertId,
                    agent_id: agentId,
                    bus_number,
                    bus_type,
                    total_seats,
                    available_seats: total_seats,
                    source,
                    destination,
                    departure_time,
                    arrival_time,
                    fare_per_seat,
                    status: 'active'
                }
            }
        });
    } catch (error) {
        console.error('Create vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            bus_number,
            bus_type,
            total_seats,
            available_seats,
            source,
            destination,
            departure_time,
            arrival_time,
            fare_per_seat,
            status
        } = req.body;
        const agentId = req.user.agent_id;

        // Check if vehicle exists and belongs to this agent
        const [existingVehicles] = await db.execute(
            'SELECT bus_id FROM vehicle WHERE bus_id = ? AND agent_id = ?',
            [id, agentId]
        );

        if (existingVehicles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Update vehicle
        await db.execute(
            'UPDATE vehicle SET bus_number = ?, bus_type = ?, total_seats = ?, available_seats = ?, source = ?, destination = ?, departure_time = ?, arrival_time = ?, fare_per_seat = ?, status = ? WHERE bus_id = ? AND agent_id = ?',
            [bus_number, bus_type, total_seats, available_seats, source, destination, departure_time, arrival_time, fare_per_seat, status, id, agentId]
        );

        // Get updated vehicle details
        const [updatedVehicles] = await db.execute(
            'SELECT * FROM vehicle WHERE bus_id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Vehicle updated successfully',
            data: {
                vehicle: updatedVehicles[0]
            }
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const agentId = req.user.agent_id;

        // Check if vehicle exists and belongs to this agent
        const [existingVehicles] = await db.execute(
            'SELECT bus_id FROM vehicle WHERE bus_id = ? AND agent_id = ?',
            [id, agentId]
        );

        if (existingVehicles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Check if there are any confirmed bookings for this vehicle
        const [bookings] = await db.execute(
            'SELECT booking_id FROM booking WHERE bus_id = ? AND status = "confirmed"',
            [id]
        );

        if (bookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete vehicle with confirmed bookings'
            });
        }

        // Delete vehicle
        await db.execute(
            'DELETE FROM vehicle WHERE bus_id = ? AND agent_id = ?',
            [id, agentId]
        );

        res.json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAgentVehicles = async (req, res) => {
    try {
        const agentId = req.user.agent_id;

        const [vehicles] = await db.execute(
            'SELECT * FROM vehicle WHERE agent_id = ? ORDER BY created_at DESC',
            [agentId]
        );

        res.json({
            success: true,
            data: {
                vehicles,
                count: vehicles.length
            }
        });
    } catch (error) {
        console.error('Get agent vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const bookVehicle = async (req, res) => {
    try {
        const {
            bus_id,
            travel_date,
            seats_booked
        } = req.body;
        const customerId = req.user.customer_id;

        // Get vehicle details
        const [vehicles] = await db.execute(
            'SELECT * FROM vehicle WHERE bus_id = ? AND status = "active"',
            [bus_id]
        );

        if (vehicles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found or not available'
            });
        }

        const vehicle = vehicles[0];

        // Check if enough seats are available
        if (vehicle.available_seats < seats_booked) {
            return res.status(400).json({
                success: false,
                message: 'Not enough seats available'
            });
        }

        const totalAmount = vehicle.fare_per_seat * seats_booked;

        // Create booking
        const [result] = await db.execute(
            'INSERT INTO booking (customer_id, bus_id, travel_date, total_amount, seats_booked) VALUES (?, ?, ?, ?, ?)',
            [customerId, bus_id, travel_date, totalAmount, seats_booked]
        );

        // Update available seats
        await db.execute(
            'UPDATE vehicle SET available_seats = available_seats - ? WHERE bus_id = ?',
            [seats_booked, bus_id]
        );

        res.status(201).json({
            success: true,
            message: 'Vehicle booked successfully',
            data: {
                booking: {
                    booking_id: result.insertId,
                    bus_id,
                    travel_date,
                    total_amount: totalAmount,
                    seats_booked,
                    status: 'pending'
                }
            }
        });
    } catch (error) {
        console.error('Book vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAgentVehicles,
    bookVehicle
};
