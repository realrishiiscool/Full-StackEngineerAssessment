const Asset = require('./Asset');
const Technician = require('./Technician');
const WorkOrder = require('./WorkOrder');
const WorkOrderHistory = require('./WorkOrderHistory');

// Associations
Asset.hasMany(WorkOrder, {
  foreignKey: 'assetId',
  as: 'workOrders',
});

WorkOrder.belongsTo(Asset, {
  foreignKey: 'assetId',
  as: 'Asset',
});

Technician.hasMany(WorkOrder, {
  foreignKey: 'assignedTechnicianId',
  as: 'workOrders',
});

WorkOrder.belongsTo(Technician, {
  foreignKey: 'assignedTechnicianId',
  as: 'Technician',
});

WorkOrder.hasMany(WorkOrderHistory, {
  foreignKey: 'workOrderId',
  as: 'statusHistory',
  onDelete: 'CASCADE',
});

WorkOrderHistory.belongsTo(WorkOrder, {
  foreignKey: 'workOrderId',
  as: 'workOrder',
});

module.exports = { Asset, Technician, WorkOrder, WorkOrderHistory };
