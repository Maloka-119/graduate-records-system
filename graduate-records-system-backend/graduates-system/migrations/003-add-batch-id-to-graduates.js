"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("graduates", "batch_id", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "default_batch", // قيم مؤقتة علشان الـexisting records
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("graduates", "batch_id");
  },
};
