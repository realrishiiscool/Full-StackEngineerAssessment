const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const WorkOrderHistory = sequelize.define('WorkOrderHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workOrderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'work_orders',
      key: 'id',
    },
  },
  fromStatus: {
    type: DataTypes.ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    allowNull: true,
  },
  toStatus: {
    type: DataTypes.ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
  },
  changedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'work_order_history',
  timestamps: false,
  indexes: [{ fields: ['workOrderId', 'changedAt'] }],
});

module.exports = WorkOrderHistory;
