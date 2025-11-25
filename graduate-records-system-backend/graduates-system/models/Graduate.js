const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Graduate = sequelize.define(
  "Graduate",
  {
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    national_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    faculty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    graduation_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "graduates",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Graduate;
