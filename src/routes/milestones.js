const express = require('express');
const { Milestone, Project, User } = require('../models');
const { authenticateToken, requireOwnership } = require('../middleware/auth');
const { milestoneValidation, uuidValidation } = require('../middleware/validation');

const router = express.Router();

// Get milestones for a project
router.get('/project/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const canView = req.user.role === 'project_manager' ||
                   project.homeownerId === req.user.id ||
                   (req.user.role === 'contractor' && project.status === 'in_progress');

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const milestones = await Milestone.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['order', 'ASC']]
    });

    res.json({ milestones });
  } catch (error) {
    next(error);
  }
});

// Get milestone by ID
router.get('/:id', authenticateToken, uuidValidation, async (req, res, next) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project', include: [{ model: User, as: 'homeowner' }] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Check permissions
    const canView = req.user.role === 'project_manager' ||
                   milestone.project.homeownerId === req.user.id ||
                   milestone.assignedTo === req.user.id;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ milestone });
  } catch (error) {
    next(error);
  }
});

// Create new milestone
router.post('/', authenticateToken, milestoneValidation, async (req, res, next) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions (only project owner or project manager)
    if (project.homeownerId !== req.user.id && req.user.role !== 'project_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const milestone = await Milestone.create(req.body);
    
    res.status(201).json({ 
      message: 'Milestone created successfully', 
      milestone 
    });
  } catch (error) {
    next(error);
  }
});

// Update milestone
router.put('/:id', authenticateToken, uuidValidation, requireOwnership('milestone'), async (req, res, next) => {
  try {
    const allowedUpdates = ['title', 'description', 'status', 'order', 'estimatedStartDate', 'estimatedEndDate', 'actualStartDate', 'actualEndDate', 'notes'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Auto-set actual dates based on status
    if (updates.status === 'in_progress' && !req.resource.actualStartDate) {
      updates.actualStartDate = new Date();
    }
    if (updates.status === 'completed' && !req.resource.actualEndDate) {
      updates.actualEndDate = new Date();
    }

    await req.resource.update(updates);
    
    res.json({ 
      message: 'Milestone updated successfully', 
      milestone: req.resource 
    });
  } catch (error) {
    next(error);
  }
});

// Delete milestone
router.delete('/:id', authenticateToken, uuidValidation, requireOwnership('milestone'), async (req, res, next) => {
  try {
    await req.resource.destroy();
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;