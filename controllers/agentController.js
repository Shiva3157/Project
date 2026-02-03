const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (agentId, role = 'agent') => {
    return jwt.sign({ agentId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const agentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find agent
        const [agents] = await db.execute(
            'SELECT agent_id, admin_id, name, email, password, phone, commission_rate, status FROM agent WHERE email = ? AND status = "active"',
            [email]
        );

        if (agents.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const agent = agents[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, agent.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(agent.agent_id, 'agent');

        res.json({
            success: true,
            message: 'Agent login successful',
            data: {
                agent: {
                    agent_id: agent.agent_id,
                    admin_id: agent.admin_id,
                    name: agent.name,
                    email: agent.email,
                    phone: agent.phone,
                    commission_rate: agent.commission_rate,
                    status: agent.status
                },
                token,
                role: 'agent'
            }
        });
    } catch (error) {
        console.error('Agent login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

const getAgentProfile = async (req, res) => {
    try {
        const agentId = req.user.agent_id;

        const [agents] = await db.execute(
            'SELECT agent_id, admin_id, name, email, phone, commission_rate, status, created_at FROM agent WHERE agent_id = ?',
            [agentId]
        );

        if (agents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.json({
            success: true,
            data: {
                agent: agents[0]
            }
        });
    } catch (error) {
        console.error('Get agent profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateAgentProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const agentId = req.user.agent_id;

        // Update agent profile
        await db.execute(
            'UPDATE agent SET name = ?, phone = ? WHERE agent_id = ?',
            [name, phone, agentId]
        );

        // Get updated agent details
        const [updatedAgents] = await db.execute(
            'SELECT agent_id, admin_id, name, email, phone, commission_rate, status FROM agent WHERE agent_id = ?',
            [agentId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                agent: updatedAgents[0]
            }
        });
    } catch (error) {
        console.error('Update agent profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const changeAgentPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const agentId = req.user.agent_id;

        // Get current password hash
        const [agents] = await db.execute(
            'SELECT password FROM agent WHERE agent_id = ?',
            [agentId]
        );

        if (agents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, agents[0].password);
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
            'UPDATE agent SET password = ? WHERE agent_id = ?',
            [hashedNewPassword, agentId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change agent password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAgentDashboard = async (req, res) => {
    try {
        const agentId = req.user.agent_id;

        // Get agent statistics
        const [packageCount] = await db.execute(
            'SELECT COUNT(*) as count FROM package WHERE agent_id = ?',
            [agentId]
        );

        const [vehicleCount] = await db.execute(
            'SELECT COUNT(*) as count FROM vehicle WHERE agent_id = ?',
            [agentId]
        );

        const [bookingCount] = await db.execute(
            'SELECT COUNT(*) as count FROM booking b LEFT JOIN package p ON b.package_id = p.package_id LEFT JOIN vehicle v ON b.bus_id = v.bus_id WHERE p.agent_id = ? OR v.agent_id = ?',
            [agentId, agentId]
        );

        const [totalRevenue] = await db.execute(
            'SELECT COALESCE(SUM(b.total_amount), 0) as revenue FROM booking b LEFT JOIN package p ON b.package_id = p.package_id LEFT JOIN vehicle v ON b.bus_id = v.bus_id WHERE (p.agent_id = ? OR v.agent_id = ?) AND b.status = "confirmed"',
            [agentId, agentId]
        );

        const [commission] = await db.execute(
            'SELECT commission_rate FROM agent WHERE agent_id = ?',
            [agentId]
        );

        const totalCommission = (totalRevenue[0].revenue * commission[0].commission_rate) / 100;

        // Get recent bookings
        const [recentBookings] = await db.execute(
            `SELECT 
                b.booking_id,
                b.travel_date,
                b.total_amount,
                b.status,
                c.full_name as customer_name,
                p.title as package_title,
                v.bus_number,
                v.source,
                v.destination as vehicle_destination,
                p.destination as package_destination
            FROM booking b
            LEFT JOIN customer c ON b.customer_id = c.customer_id
            LEFT JOIN package p ON b.package_id = p.package_id
            LEFT JOIN vehicle v ON b.bus_id = v.bus_id
            WHERE p.agent_id = ? OR v.agent_id = ?
            ORDER BY b.created_at DESC
            LIMIT 10`,
            [agentId, agentId]
        );

        res.json({
            success: true,
            data: {
                stats: {
                    packages: packageCount[0].count,
                    vehicles: vehicleCount[0].count,
                    bookings: bookingCount[0].count,
                    revenue: totalRevenue[0].revenue,
                    commission: totalCommission
                },
                recentBookings
            }
        });
    } catch (error) {
        console.error('Get agent dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    agentLogin,
    getAgentProfile,
    updateAgentProfile,
    changeAgentPassword,
    getAgentDashboard
};
