const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bid = sequelize.define('Bid', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    contractorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    estimatedDuration: {
      type: DataTypes.INTEGER, // Duration in days
      allowNull: false,
      validate: {
        min: 1
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'withdrawn'),
      defaultValue: 'pending'
    },
    proposedStartDate: {
      type: DataTypes.DATE
    },
    materials: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    laborBreakdown: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    warranty: {
      type: DataTypes.STRING
    },
    validUntil: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'bids',
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['contractorId'] },
      { fields: ['status'] },
      { fields: ['price'] }
    ]
  });

  return Bid;
};