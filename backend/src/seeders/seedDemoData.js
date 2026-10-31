const sequelize = require('../database');
const { Asset, Technician, WorkOrder } = require('../models');

const DEMO_ASSETS = [
  {
    assetId: 'AST-001', assetType: 'MECHANICAL', manufacturer: 'Caterpillar',
    model: 'CAT-3516', serialNumber: 'SN-CAT-001', usageHours: 1250.5,
    usageCycles: 340, status: 'ACTIVE',
  },
  {
    assetId: 'AST-002', assetType: 'ELECTRICAL', manufacturer: 'Siemens',
    model: 'SIMOTICS-GP', serialNumber: 'SN-SIE-002', usageHours: 3200,
    usageCycles: 890, status: 'UNDER_MAINTENANCE',
  },
  {
    assetId: 'AST-003', assetType: 'HYDRAULIC', manufacturer: 'Bosch Rexroth',
    model: 'A10VSO-45', serialNumber: 'SN-BOS-003', usageHours: 580.25,
    usageCycles: 120, status: 'ACTIVE',
  },
  {
    assetId: 'AST-004', assetType: 'PNEUMATIC', manufacturer: 'SMC Corporation',
    model: 'CP96-80', serialNumber: 'SN-SMC-004', usageHours: 4500,
    usageCycles: 1500, status: 'OUT_OF_SERVICE',
  },
  {
    assetId: 'AST-005', assetType: 'ELECTRONIC', manufacturer: 'ABB',
    model: 'ACS880-01', serialNumber: 'SN-ABB-005', usageHours: 920.75,
    usageCycles: 250, status: 'INACTIVE',
  },
];

const DEMO_TECHNICIANS = [
  { name: 'Alice Johnson', skill: 'MECHANICAL', status: 'AVAILABLE' },
  { name: 'Bob Smith', skill: 'ELECTRICAL', status: 'BUSY' },
  { name: 'Carlos Rivera', skill: 'PLUMBING', status: 'AVAILABLE' },
  { name: 'Diana Chen', skill: 'SPECIALIST', status: 'OFF_DUTY' },
];

const DEMO_WORK_ORDERS = [
  {
    workOrderNumber: 'WO-2024-001', assetId: 'AST-001', maintenanceType: 'PREVENTIVE',
    description: 'Scheduled oil change and filter replacement for engine unit.',
    priority: 'MEDIUM', technician: 'Alice Johnson', scheduledDate: '2025-02-15',
    status: 'COMPLETED', createdDate: '2024-12-01', completedDate: '2025-02-15',
  },
  {
    workOrderNumber: 'WO-2024-002', assetId: 'AST-002', maintenanceType: 'CORRECTIVE',
    description: 'Motor winding repair due to overheating detected during inspection.',
    priority: 'HIGH', technician: 'Bob Smith', scheduledDate: '2025-03-10',
    status: 'IN_PROGRESS', createdDate: '2025-01-15',
  },
  {
    workOrderNumber: 'WO-2024-003', assetId: 'AST-003', maintenanceType: 'INSPECTION',
    description: 'Quarterly hydraulic pressure and seal integrity inspection.',
    priority: 'LOW', technician: null, scheduledDate: '2025-04-01',
    status: 'OPEN', createdDate: '2025-02-20',
  },
  {
    workOrderNumber: 'WO-2024-004', assetId: 'AST-004', maintenanceType: 'EMERGENCY',
    description: 'Emergency repair: pneumatic cylinder failure causing line shutdown.',
    priority: 'CRITICAL', technician: 'Alice Johnson', scheduledDate: '2025-01-10',
    status: 'ASSIGNED', createdDate: '2025-01-09',
  },
  {
    workOrderNumber: 'WO-2024-005', assetId: 'AST-001', maintenanceType: 'PREVENTIVE',
    description: 'Belt tension check and coolant level verification.',
    priority: 'MEDIUM', technician: 'Carlos Rivera', scheduledDate: '2025-05-20',
    status: 'CANCELLED', createdDate: '2025-03-01',
  },
  {
    workOrderNumber: 'WO-2024-006', assetId: 'AST-005', maintenanceType: 'CORRECTIVE',
    description: 'Variable frequency drive parameter recalibration and firmware update.',
    priority: 'HIGH', technician: 'Diana Chen', scheduledDate: '2025-06-15',
    status: 'OPEN', createdDate: '2025-04-10',
  },
];

/**
 * Add any missing demo rows without clearing or overwriting application data.
 * Unique asset/work-order IDs are the stable keys; technicians use name + skill.
 */
async function seedDemoData() {
  return sequelize.transaction(async (transaction) => {
    const assetIds = new Map();
    for (const assetData of DEMO_ASSETS) {
      const [asset] = await Asset.findOrCreate({
        where: { assetId: assetData.assetId },
        defaults: assetData,
        transaction,
      });
      assetIds.set(assetData.assetId, asset.id);
    }

    const technicianIds = new Map();
    for (const technicianData of DEMO_TECHNICIANS) {
      const [technician] = await Technician.findOrCreate({
        where: { name: technicianData.name, skill: technicianData.skill },
        defaults: technicianData,
        transaction,
      });
      technicianIds.set(technicianData.name, technician.id);
    }

    for (const order of DEMO_WORK_ORDERS) {
      const { technician, assetId, ...orderData } = order;
      await WorkOrder.findOrCreate({
        where: { workOrderNumber: order.workOrderNumber },
        defaults: {
          ...orderData,
          assetId: assetIds.get(assetId),
          assignedTechnicianId: technician ? technicianIds.get(technician) : null,
        },
        transaction,
      });
    }

    return {
      assets: DEMO_ASSETS.length,
      technicians: DEMO_TECHNICIANS.length,
      workOrders: DEMO_WORK_ORDERS.length,
    };
  });
}

module.exports = seedDemoData;
