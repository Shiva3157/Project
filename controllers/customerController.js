const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (customerId, role = 'customer') => {
    return jwt.sign({ customerId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const customerRegister = async (req, res) => {
    try {
        const { full_name, address, email, phone, password } = req.body;

        // Check if customer already exists
        const [existingCustomers] = await db.execute(
            'SELECT customer_id FROM customer WHERE email = ?',
            [email]
        );

        if (existingCustomers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create customer
        const [result] = await db.execute(
            'INSERT INTO customer (full_name, address, email, phone, password) VALUES (?, ?, ?, ?, ?)',
            [full_name, address, email, phone, hashedPassword]
        );

        const token = generateToken(result.insertId);

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            data: {
                customer: {
                    customer_id: result.insertId,
                    full_name,
                    address,
                    email,
                    phone
                },
                token
            }
        });
    } catch (error) {
        console.error('Customer registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

const customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find customer
        const [customers] = await db.execute(
            'SELECT customer_id, full_name, address, email, phone, password FROM customer WHERE email = ?',
            [email]
        );

        if (customers.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const customer = customers[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(customer.customer_id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                customer: {
                    customer_id: customer.customer_id,
                    full_name: customer.full_name,
                    address: customer.address,
                    email: customer.email,
                    phone: customer.phone
                },
                token
            }
        });
    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

const getCustomerProfile = async (req, res) => {
    try {
        const customerId = req.user.customer_id;

        const [customers] = await db.execute(
            'SELECT customer_id, full_name, address, email, phone, id_type, id_number, gender, country, created_at FROM customer WHERE customer_id = ?',
            [customerId]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: {
                customer: customers[0]
            }
        });
    } catch (error) {
        console.error('Get customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateCustomerProfile = async (req, res) => {
    try {
        const { full_name, address, phone, id_type, id_number, gender, country, name } = req.body;
        const customerId = req.user.customer_id;

        // Use 'name' if provided, otherwise use 'full_name' for backward compatibility
        const finalFullName = name || full_name;

        // Update customer profile
        await db.execute(
            'UPDATE customer SET full_name = ?, address = ?, phone = ?, id_type = ?, id_number = ?, gender = ?, country = ? WHERE customer_id = ?',
            [finalFullName, address, phone, id_type, id_number, gender, country, customerId]
        );

        // Get updated customer details
        const [updatedCustomers] = await db.execute(
            'SELECT customer_id, full_name, address, email, phone, id_type, id_number, gender, country FROM customer WHERE customer_id = ?',
            [customerId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                customer: updatedCustomers[0]
            }
        });
    } catch (error) {
        console.error('Update customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const changeCustomerPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const customerId = req.user.customer_id;

        // Get current password hash
        const [customers] = await db.execute(
            'SELECT password FROM customer WHERE customer_id = ?',
            [customerId]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customers[0].password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.execute(
            'UPDATE customer SET password = ? WHERE customer_id = ?',
            [hashedNewPassword, customerId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change customer password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.user.customer_id;

        const [bookings] = await db.execute(
            `SELECT 
                b.*,
                p.title as package_title,
                p.destination as package_destination,
                p.start_location,
                v.bus_number,
                v.source,
                v.destination as vehicle_destination,
                v.bus_type,
                pay.payment_status,
                pay.payment_method
            FROM booking b
            LEFT JOIN package p ON b.package_id = p.package_id
            LEFT JOIN vehicle v ON b.bus_id = v.bus_id
            LEFT JOIN payment pay ON b.booking_id = pay.booking_id
            WHERE b.customer_id = ?
            ORDER BY b.created_at DESC`,
            [customerId]
        );

        res.json({
            success: true,
            data: {
                bookings,
                count: bookings.length
            }
        });
    } catch (error) {
        console.error('Get customer bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    customerRegister,
    customerLogin,
    getCustomerProfile,
    updateCustomerProfile,
    changeCustomerPassword,
    getCustomerBookings
};
