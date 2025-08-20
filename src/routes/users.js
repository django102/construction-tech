const express = require('express');
const { User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uuidValidation } = require('../middleware/validation');

const router = express.Router();

// Get all contractors (for homeowners to browse)
router.get('/contractors', authenticateToken, async (req, res, next) => {
  try {
    const { specialization, location, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = { role: 'contractor', isActive: true };
    
    if (specialization) {
      where.specializations = { [Op.contains]: [specialization] };
    }
    
    if (location) {
      where.address = { [Op.iLike]: `%${location}%` };
    }

    const contractors = await User.findAndCountAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address', 'bio', 'yearsExperience', 'specializations', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['yearsExperience', 'DESC']]
    });

    res.json({
      contractors: contractors.rows,
      pagination: {
        total: contractors.count,
        page: parseInt(page),
        pages: Math.ceil(contractors.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID (public profile)
router.get('/:id', authenticateToken, uuidValidation, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address', 'bio', 'yearsExperience', 'specializations', 'role', 'createdAt']
    });

    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;