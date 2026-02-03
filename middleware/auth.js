const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check user type and verify existence
        if (decoded.role === 'admin' && decoded.adminId) {
            const [admins] = await db.execute(
                'SELECT admin_id, name, email, phone FROM admin WHERE admin_id = ?',
                [decoded.adminId]
            );

            if (admins.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token - admin not found' 
                });
            }

            req.user = { ...admins[0], role: 'admin' };
        } else if (decoded.role === 'agent' && decoded.agentId) {
            const [agents] = await db.execute(
                'SELECT agent_id, admin_id, name, email, phone, commission_rate, status FROM agent WHERE agent_id = ? AND status = "active"',
                [decoded.agentId]
            );

            if (agents.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token - agent not found or inactive' 
                });
            }

            req.user = { ...agents[0], role: 'agent' };
        } else if (decoded.role === 'customer' && decoded.customerId) {
            const [customers] = await db.execute(
                'SELECT customer_id, full_name, address, email, phone FROM customer WHERE customer_id = ?',
                [decoded.customerId]
            );

            if (customers.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token - customer not found' 
                });
            }

            req.user = { ...customers[0], role: 'customer' };
        } else {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format' 
            });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};

const authenticateAdmin = async (req, res, next) => {
    await authenticateToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        next();
    });
};

const authenticateAgent = async (req, res, next) => {
    await authenticateToken(req, res, () => {
        if (req.user.role !== 'agent') {
            return res.status(403).json({
                success: false,
                message: 'Agent access required'
            });
        }
        next();
    });
};

const authenticateCustomer = async (req, res, next) => {
    await authenticateToken(req, res, () => {
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Customer access required'
            });
        }
        next();
    });
};

module.exports = { 
    authenticateToken, 
    authenticateAdmin, 
    authenticateAgent, 
    authenticateCustomer 
};
