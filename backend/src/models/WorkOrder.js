const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workOrderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'workOrderNumber cannot be empty' },
    },
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assets',
      key: 'id',
    },
  },
  maintenanceType: {
    type: DataTypes.ENUM('INSPECTION', 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['INSPECTION', 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY']],
        msg: 'maintenanceType must be one of: INSPECTION, PREVENTIVE, CORRECTIVE, EMERGENCY',
      },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'description cannot be empty' },
    },
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']],
        msg: 'priority must be one of: LOW, MEDIUM, HIGH, CRITICAL',
      },
    },
  },
  assignedTechnicianId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'technicians',
      key: 'id',
    },
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    // Historical rows may be missing this value; the create API requires it.
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'OPEN',
    validate: {
      isIn: {
        args: [['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']],
        msg: 'status must be one of: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED',
      },
    },
  },
  createdDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  completedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'work_orders',
});

module.exports = WorkOrder;
