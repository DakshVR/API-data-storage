const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");

const Review = sequelize.define("review", {
  userid: { type: DataTypes.INTEGER, allowNull: false },
  businessid: { type: DataTypes.INTEGER, allowNull: false },
  dollars: { type: DataTypes.INTEGER, allowNull: false },
  stars: { type: DataTypes.FLOAT, allowNull: false },
  review: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Review;
