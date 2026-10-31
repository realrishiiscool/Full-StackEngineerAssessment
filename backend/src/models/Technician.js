const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Technician = sequelize.define('Technician', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'name cannot be empty' },
    },
  },
  skill: {
    type: DataTypes.ENUM('MECHANICAL', 'ELECTRICAL', 'PLUMBING', 'GENERAL', 'SPECIALIST'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['MECHANICAL', 'ELECTRICAL', 'PLUMBING', 'GENERAL', 'SPECIALIST']],
        msg: 'skill must be one of: MECHANICAL, ELECTRICAL, PLUMBING, GENERAL, SPECIALIST',
      },
    },
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'BUSY', 'OFF_DUTY'),
    defaultValue: 'AVAILABLE',
    validate: {
      isIn: {
        args: [['AVAILABLE', 'BUSY', 'OFF_DUTY']],
        msg: 'status must be one of: AVAILABLE, BUSY, OFF_DUTY',
      },
    },
  },
}, {
  tableName: 'technicians',
});

module.exports = Technician;
