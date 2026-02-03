const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

const validateRegistration = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    
    handleValidationErrors
];

const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('Username is required'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

const validateCustomer = [
    body('id_type')
        .isIn(['Aadhar Card', 'Passport', 'Driving Licence', 'Others'])
        .withMessage('Invalid ID type'),
    
    body('id_number')
        .isLength({ min: 5, max: 50 })
        .withMessage('ID number must be between 5 and 50 characters'),
    
    body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    
    body('gender')
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Invalid gender'),
    
    body('country')
        .isLength({ min: 2, max: 50 })
        .withMessage('Country must be between 2 and 50 characters'),
    
    body('phone')
        .matches(/^[+]?[\d\s\-()]+$/)
        .withMessage('Invalid phone number format'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),
    
    handleValidationErrors
];

const validateBooking = [
    body('package_id')
        .isInt({ min: 1 })
        .withMessage('Valid package ID is required'),
    
    body('customer_name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Customer name must be between 2 and 100 characters'),
    
    body('customer_email')
        .isEmail()
        .withMessage('Valid customer email is required'),
    
    body('customer_phone')
        .matches(/^[+]?[\d\s\-()]+$/)
        .withMessage('Invalid phone number format'),
    
    body('number_of_persons')
        .isInt({ min: 1, max: 20 })
        .withMessage('Number of persons must be between 1 and 20'),
    
    body('travel_date')
        .isISO8601()
        .withMessage('Valid travel date is required'),
    
    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateCustomer,
    validateBooking,
    handleValidationErrors
};
