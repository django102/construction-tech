const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Milestone = sequelize.define('Milestone', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'blocked'),
      defaultValue: 'pending'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    estimatedStartDate: {
      type: DataTypes.DATE
    },
    estimatedEndDate: {
      type: DataTypes.DATE
    },
    actualStartDate: {
      type: DataTypes.DATE
    },
    actualEndDate: {
      type: DataTypes.DATE
    },
    assignedTo: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    paymentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'milestones',
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['assignedTo'] },
      { fields: ['status'] },
      { fields: ['order'] }
    ]
  });

  return Milestone;
};