const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  assetId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'assetId cannot be empty' },
    },
  },
  assetType: {
    type: DataTypes.ENUM('MECHANICAL', 'ELECTRICAL', 'HYDRAULIC', 'PNEUMATIC', 'ELECTRONIC'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['MECHANICAL', 'ELECTRICAL', 'HYDRAULIC', 'PNEUMATIC', 'ELECTRONIC']],
        msg: 'assetType must be one of: MECHANICAL, ELECTRICAL, HYDRAULIC, PNEUMATIC, ELECTRONIC',
      },
    },
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'manufacturer cannot be empty' },
    },
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'model cannot be empty' },
    },
  },
  serialNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'serialNumber cannot be empty' },
    },
  },
  usageHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'usageHours must be non-negative' },
    },
  },
  usageCycles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'usageCycles must be non-negative' },
    },
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'),
    defaultValue: 'ACTIVE',
    validate: {
      isIn: {
        args: [['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE']],
        msg: 'status must be one of: ACTIVE, INACTIVE, UNDER_MAINTENANCE, OUT_OF_SERVICE',
      },
    },
  },
}, {
  tableName: 'assets',
});

module.exports = Asset;
