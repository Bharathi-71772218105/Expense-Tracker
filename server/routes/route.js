const routes = require('express').Router();
const controller = require('../controller/controller');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
    
    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            console.log('Auth middleware - JWT verification failed:', err.message);
            return res.status(403).json({ message: 'Invalid token' });
        }
        console.log('Auth middleware - User authenticated:', { id: user.id, username: user.username });
        req.user = user;
        next();
    });
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

routes.route('/api/register')
    .post(controller.register);

routes.route('/api/login')
    .post(controller.login);

routes.route('/api/profile')
    .get(authenticateToken, controller.getProfile);

routes.route('/api/categories')
    .post(controller.create_categories)
    .get(controller.get_categories);

routes.route('/api/transaction')
    .post(authenticateToken, controller.create_transaction)
    .get(authenticateToken, controller.get_transaction)
    .delete(authenticateToken, controller.delete_transaction)
    .put(authenticateToken, controller.update_transaction);

routes.route('/api/labels')
    .get(authenticateToken, controller.get_labels);

routes.route('/api/summary')
    .get(authenticateToken, controller.get_summary);

module.exports = routes;
