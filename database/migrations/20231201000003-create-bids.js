'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bids', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      contractorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      estimatedDuration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'withdrawn'),
        defaultValue: 'pending'
      },
      proposedStartDate: {
        type: Sequelize.DATE
      },
      materials: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      laborBreakdown: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      warranty: {
        type: Sequelize.STRING
      },
      validUntil: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('bids', ['projectId']);
    await queryInterface.addIndex('bids', ['contractorId']);
    await queryInterface.addIndex('bids', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bids');
  }
};