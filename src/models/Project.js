const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'open', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'draft'
    },
    category: {
      type: DataTypes.ENUM(
        'renovation', 'new_construction', 'repair', 'landscaping', 
        'electrical', 'plumbing', 'roofing', 'flooring', 'painting', 'other'
      ),
      allowNull: false
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    expectedStartDate: {
      type: DataTypes.DATE
    },
    expectedEndDate: {
      type: DataTypes.DATE
    },
    actualStartDate: {
      type: DataTypes.DATE
    },
    actualEndDate: {
      type: DataTypes.DATE
    },
    homeownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    acceptedBidId: {
      type: DataTypes.UUID,
      references: {
        model: 'bids',
        key: 'id'
      }
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    requirements: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'projects',
    timestamps: true,
    indexes: [
      { fields: ['homeownerId'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['location'] }
    ]
  });

  return Project;
};