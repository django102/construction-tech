const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { User, Project, Bid, Milestone } = require('../models');
      const resourceId = req.params.id || req.params.projectId;
      
      let resource;
      let isOwner = false;

      switch (resourceType) {
        case 'project':
          resource = await Project.findByPk(resourceId);
          isOwner = resource && resource.homeownerId === req.user.id;
          break;
        case 'bid':
          resource = await Bid.findByPk(resourceId, {
            include: [{ model: Project, as: 'project' }]
          });
          isOwner = resource && (
            resource.contractorId === req.user.id || 
            resource.project.homeownerId === req.user.id
          );
          break;
        case 'milestone':
          resource = await Milestone.findByPk(resourceId, {
            include: [{ model: Project, as: 'project' }]
          });
          isOwner = resource && (
            resource.project.homeownerId === req.user.id ||
            resource.assignedTo === req.user.id
          );
          break;
      }

      if (!resource) {
        return res.status(404).json({ error: `${resourceType} not found` });
      }

      if (!isOwner && req.user.role !== 'project_manager') {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership
};