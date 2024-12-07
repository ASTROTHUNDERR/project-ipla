'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('user_profile_socials', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_profile_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        unique: true,
      },
      profile_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profile_nickname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      provider: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['yt', 'fb', 'ig', 'x']
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('user_profile_socials');
  }
};
