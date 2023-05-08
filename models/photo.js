const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");

const Photo = sequelize.define("photo", {
  userid: { type: DataTypes.INTEGER, allowNull: false },
  caption: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Photo;
