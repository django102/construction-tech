const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DATABASE_URL || {
    database: process.env.DB_NAME || 'construction_tech',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? logger.debug : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./User')(sequelize);
const Project = require('./Project')(sequelize);
const Bid = require('./Bid')(sequelize);
const Milestone = require('./Milestone')(sequelize);

// Define associations
User.hasMany(Project, { foreignKey: 'homeownerId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'homeownerId', as: 'homeowner' });

User.hasMany(Bid, { foreignKey: 'contractorId', as: 'bids' });
Bid.belongsTo(User, { foreignKey: 'contractorId', as: 'contractor' });

Project.hasMany(Bid, { foreignKey: 'projectId', as: 'bids' });
Bid.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Project.hasMany(Milestone, { foreignKey: 'projectId', as: 'milestones' });
Milestone.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(Milestone, { foreignKey: 'assignedTo', as: 'assignedMilestones' });
Milestone.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

module.exports = {
  sequelize,
  User,
  Project,
  Bid,
  Milestone
};