'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2)
      },
      status: {
        type: Sequelize.ENUM('draft', 'open', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'draft'
      },
      category: {
        type: Sequelize.ENUM(
          'renovation', 'new_construction', 'repair', 'landscaping',
          'electrical', 'plumbing', 'roofing', 'flooring', 'painting', 'other'
        ),
        allowNull: false
      },
      urgency: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
      },
      expectedStartDate: {
        type: Sequelize.DATE
      },
      expectedEndDate: {
        type: Sequelize.DATE
      },
      actualStartDate: {
        type: Sequelize.DATE
      },
      actualEndDate: {
        type: Sequelize.DATE
      },
      homeownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      acceptedBidId: {
        type: Sequelize.UUID
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      requirements: {
        type: Sequelize.JSONB,
        defaultValue: {}
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

    await queryInterface.addIndex('projects', ['homeownerId']);
    await queryInterface.addIndex('projects', ['status']);
    await queryInterface.addIndex('projects', ['category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('projects');
  }
};