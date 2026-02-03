const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (adminId, role = 'admin') => {
    return jwt.sign({ adminId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const [admins] = await db.execute(
            'SELECT admin_id, name, email, password, phone FROM admin WHERE email = ?',
            [email]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const admin = admins[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(admin.admin_id, 'admin');

        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                admin: {
                    admin_id: admin.admin_id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone
                },
                token,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

const createAgent = async (req, res) => {
    try {
        const { name, email, phone, commission_rate, password } = req.body;
        const adminId = req.user.admin_id;

        // Check if agent email already exists
        const [existingAgents] = await db.execute(
            'SELECT agent_id FROM agent WHERE email = ?',
            [email]
        );

        if (existingAgents.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Agent email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create agent
        const [result] = await db.execute(
            'INSERT INTO agent (admin_id, name, email, phone, commission_rate, password) VALUES (?, ?, ?, ?, ?, ?)',
            [adminId, name, email, phone, commission_rate || 0.00, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            data: {
                agent: {
                    agent_id: result.insertId,
                    admin_id: adminId,
                    name,
                    email,
                    phone,
                    commission_rate: commission_rate || 0.00,
                    status: 'active'
                }
            }
        });
    } catch (error) {
        console.error('Create agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllAgents = async (req, res) => {
    try {
        const adminId = req.user.admin_id;

        const [agents] = await db.execute(
            'SELECT agent_id, name, email, phone, commission_rate, status, created_at FROM agent WHERE admin_id = ? ORDER BY created_at DESC',
            [adminId]
        );

        res.json({
            success: true,
            data: {
                agents,
                count: agents.length
            }
        });
    } catch (error) {
        console.error('Get agents error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, commission_rate, status } = req.body;
        const adminId = req.user.admin_id;

        // Check if agent exists and belongs to this admin
        const [existingAgents] = await db.execute(
            'SELECT agent_id FROM agent WHERE agent_id = ? AND admin_id = ?',
            [id, adminId]
        );

        if (existingAgents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Update agent
        await db.execute(
            'UPDATE agent SET name = ?, email = ?, phone = ?, commission_rate = ?, status = ? WHERE agent_id = ? AND admin_id = ?',
            [name, email, phone, commission_rate, status, id, adminId]
        );

        // Get updated agent details
        const [updatedAgents] = await db.execute(
            'SELECT agent_id, name, email, phone, commission_rate, status FROM agent WHERE agent_id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Agent updated successfully',
            data: {
                agent: updatedAgents[0]
            }
        });
    } catch (error) {
        console.error('Update agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.admin_id;

        // Check if agent exists and belongs to this admin
        const [existingAgents] = await db.execute(
            'SELECT agent_id FROM agent WHERE agent_id = ? AND admin_id = ?',
            [id, adminId]
        );

        if (existingAgents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Delete agent (this will cascade delete related packages and vehicles)
        await db.execute(
            'DELETE FROM agent WHERE agent_id = ? AND admin_id = ?',
            [id, adminId]
        );

        res.json({
            success: true,
            message: 'Agent deleted successfully'
        });
    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const adminId = req.user.admin_id;

        // Get various statistics
        const [agentCount] = await db.execute(
            'SELECT COUNT(*) as count FROM agent WHERE admin_id = ?',
            [adminId]
        );

        const [packageCount] = await db.execute(
            'SELECT COUNT(*) as count FROM package p JOIN agent a ON p.agent_id = a.agent_id WHERE a.admin_id = ?',
            [adminId]
        );

        const [vehicleCount] = await db.execute(
            'SELECT COUNT(*) as count FROM vehicle v JOIN agent a ON v.agent_id = a.agent_id WHERE a.admin_id = ?',
            [adminId]
        );

        const [bookingCount] = await db.execute(
            'SELECT COUNT(*) as count FROM booking b LEFT JOIN package p ON b.package_id = p.package_id LEFT JOIN vehicle v ON b.bus_id = v.bus_id LEFT JOIN agent a ON (p.agent_id = a.agent_id OR v.agent_id = a.agent_id) WHERE a.admin_id = ?',
            [adminId]
        );

        const [totalRevenue] = await db.execute(
            'SELECT COALESCE(SUM(b.total_amount), 0) as revenue FROM booking b LEFT JOIN package p ON b.package_id = p.package_id LEFT JOIN vehicle v ON b.bus_id = v.bus_id LEFT JOIN agent a ON (p.agent_id = a.agent_id OR v.agent_id = a.agent_id) WHERE a.admin_id = ? AND b.status = "confirmed"',
            [adminId]
        );

        res.json({
            success: true,
            data: {
                stats: {
                    agents: agentCount[0].count,
                    packages: packageCount[0].count,
                    vehicles: vehicleCount[0].count,
                    bookings: bookingCount[0].count,
                    revenue: totalRevenue[0].revenue
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    adminLogin,
    createAgent,
    getAllAgents,
    updateAgent,
    deleteAgent,
    getDashboardStats
};
