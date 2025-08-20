const express = require('express');
const { Op } = require('sequelize');
const { Project, User, Bid, Milestone } = require('../models');
const { authenticateToken, requireRole, requireOwnership } = require('../middleware/auth');
const { projectValidation, uuidValidation } = require('../middleware/validation');

const router = express.Router();

// Get all projects (with filtering)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, category, location, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    
    // Role-based filtering
    if (req.user.role === 'homeowner') {
      where.homeownerId = req.user.id;
    } else if (req.user.role === 'contractor') {
      where.status = { [Op.in]: ['open', 'in_progress'] };
    }

    // Add query filters
    if (status) where.status = status;
    if (category) where.category = category;
    if (location) where.location = { [Op.iLike]: `%${location}%` };

    const projects = await Project.findAndCountAll({
      where,
      include: [
        { model: User, as: 'homeowner', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Bid, as: 'bids', include: [{ model: User, as: 'contractor' }] },
        { model: Milestone, as: 'milestones' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      projects: projects.rows,
      pagination: {
        total: projects.count,
        page: parseInt(page),
        pages: Math.ceil(projects.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get project by ID
router.get('/:id', authenticateToken, uuidValidation, async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'homeowner', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { 
          model: Bid, 
          as: 'bids', 
          include: [{ model: User, as: 'contractor', attributes: ['id', 'firstName', 'lastName', 'email'] }] 
        },
        { 
          model: Milestone, 
          as: 'milestones',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const canView = req.user.role === 'project_manager' ||
                   project.homeownerId === req.user.id ||
                   (req.user.role === 'contractor' && ['open', 'in_progress'].includes(project.status));

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

// Create new project (homeowners only)
router.post('/', authenticateToken, requireRole(['homeowner']), projectValidation, async (req, res, next) => {
  try {
    const projectData = {
      ...req.body,
      homeownerId: req.user.id
    };

    const project = await Project.create(projectData);
    
    res.status(201).json({ 
      message: 'Project created successfully', 
      project 
    });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', authenticateToken, uuidValidation, requireOwnership('project'), async (req, res, next) => {
  try {
    const allowedUpdates = ['title', 'description', 'location', 'budget', 'status', 'category', 'urgency', 'expectedStartDate', 'expectedEndDate'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    await req.resource.update(updates);
    
    res.json({ 
      message: 'Project updated successfully', 
      project: req.resource 
    });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', authenticateToken, uuidValidation, requireOwnership('project'), async (req, res, next) => {
  try {
    await req.resource.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;