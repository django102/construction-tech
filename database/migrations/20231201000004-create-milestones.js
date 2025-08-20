'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('milestones', {
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
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'blocked'),
        defaultValue: 'pending'
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      estimatedStartDate: {
        type: Sequelize.DATE
      },
      estimatedEndDate: {
        type: Sequelize.DATE
      },
      actualStartDate: {
        type: Sequelize.DATE
      },
      actualEndDate: {
        type: Sequelize.DATE
      },
      assignedTo: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      paymentAmount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      isPaid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      notes: {
        type: Sequelize.TEXT
      },
      attachments: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
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

    await queryInterface.addIndex('milestones', ['projectId']);
    await queryInterface.addIndex('milestones', ['assignedTo']);
    await queryInterface.addIndex('milestones', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('milestones');
  }
};