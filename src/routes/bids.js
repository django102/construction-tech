const express = require('express');
const { Bid, Project, User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { bidValidation, uuidValidation } = require('../middleware/validation');

const router = express.Router();

// Get all bids (filtered by user role)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    let where = {};
    
    if (req.user.role === 'contractor') {
      where.contractorId = req.user.id;
    } else if (req.user.role === 'homeowner') {
      // Get bids for user's projects
      const userProjects = await Project.findAll({
        where: { homeownerId: req.user.id },
        attributes: ['id']
      });
      const projectIds = userProjects.map(p => p.id);
      where.projectId = projectIds;
    }

    const bids = await Bid.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'title', 'status'] },
        { model: User, as: 'contractor', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ bids });
  } catch (error) {
    next(error);
  }
});

// Get bid by ID
router.get('/:id', authenticateToken, uuidValidation, async (req, res, next) => {
  try {
    const bid = await Bid.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project', include: [{ model: User, as: 'homeowner' }] },
        { model: User, as: 'contractor' }
      ]
    });

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Check permissions
    const canView = req.user.role === 'project_manager' ||
                   bid.contractorId === req.user.id ||
                   bid.project.homeownerId === req.user.id;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ bid });
  } catch (error) {
    next(error);
  }
});

// Create new bid (contractors only)
router.post('/', authenticateToken, requireRole(['contractor']), bidValidation, async (req, res, next) => {
  try {
    const { projectId } = req.body;

    // Check if project exists and is open for bids
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ error: 'Project is not open for bids' });
    }

    // Check if contractor already has a bid on this project
    const existingBid = await Bid.findOne({
      where: { projectId, contractorId: req.user.id }
    });

    if (existingBid) {
      return res.status(409).json({ error: 'You have already submitted a bid for this project' });
    }

    const bidData = {
      ...req.body,
      contractorId: req.user.id
    };

    const bid = await Bid.create(bidData);
    
    res.status(201).json({ 
      message: 'Bid submitted successfully', 
      bid 
    });
  } catch (error) {
    next(error);
  }
});

// Update bid status (homeowners can accept/reject, contractors can withdraw)
router.put('/:id/status', authenticateToken, uuidValidation, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const bid = await Bid.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Permission checks
    if (status === 'withdrawn' && bid.contractorId !== req.user.id) {
      return res.status(403).json({ error: 'Only the contractor can withdraw their bid' });
    }

    if (['accepted', 'rejected'].includes(status) && bid.project.homeownerId !== req.user.id) {
      return res.status(403).json({ error: 'Only the project owner can accept or reject bids' });
    }

    await bid.update({ status });

    // If bid is accepted, update project status and reject other bids
    if (status === 'accepted') {
      await bid.project.update({ 
        status: 'in_progress', 
        acceptedBidId: bid.id 
      });

      // Reject other pending bids
      await Bid.update(
        { status: 'rejected' },
        { 
          where: { 
            projectId: bid.projectId, 
            id: { [Op.ne]: bid.id },
            status: 'pending'
          } 
        }
      );
    }

    res.json({ message: 'Bid status updated successfully', bid });
  } catch (error) {
    next(error);
  }
});

module.exports = router;