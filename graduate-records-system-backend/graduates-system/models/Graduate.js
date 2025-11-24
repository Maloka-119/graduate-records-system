// models/Graduate.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Graduate = sequelize.define(
  "Graduate",
  {
    national_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    faculty: {
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
    timestamps: false, // 🔥 غيري لـ false علشان توقفي الـtimestamps
    underscored: true,
  }
);

module.exports = Graduate;
