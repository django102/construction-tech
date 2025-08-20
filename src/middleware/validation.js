const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 100 }),
  body('firstName').trim().isLength({ min: 1, max: 50 }),
  body('lastName').trim().isLength({ min: 1, max: 50 }),
  body('role').isIn(['homeowner', 'contractor', 'project_manager']),
  body('phone').optional().isMobilePhone(),
  handleValidationErrors
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  handleValidationErrors
];

const projectValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('location').trim().isLength({ min: 1 }),
  body('category').isIn([
    'renovation', 'new_construction', 'repair', 'landscaping',
    'electrical', 'plumbing', 'roofing', 'flooring', 'painting', 'other'
  ]),
  body('budget').optional().isDecimal({ decimal_digits: '0,2' }),
  body('urgency').optional().isIn(['low', 'medium', 'high']),
  handleValidationErrors
];

const bidValidation = [
  body('projectId').isUUID(),
  body('price').isDecimal({ decimal_digits: '0,2' }),
  body('estimatedDuration').isInt({ min: 1 }),
  body('description').trim().isLength({ min: 10 }),
  body('proposedStartDate').optional().isISO8601(),
  body('validUntil').optional().isISO8601(),
  handleValidationErrors
];

const milestoneValidation = [
  body('projectId').isUUID(),
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim(),
  body('order').isInt({ min: 1 }),
  body('estimatedStartDate').optional().isISO8601(),
  body('estimatedEndDate').optional().isISO8601(),
  body('assignedTo').optional().isUUID(),
  body('paymentAmount').optional().isDecimal({ decimal_digits: '0,2' }),
  handleValidationErrors
];

const uuidValidation = [
  param('id').isUUID(),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  projectValidation,
  bidValidation,
  milestoneValidation,
  uuidValidation,
  handleValidationErrors
};