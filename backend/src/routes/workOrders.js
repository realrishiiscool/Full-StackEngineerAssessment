const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const { Op } = require('sequelize');
const { WorkOrder, Asset, Technician, WorkOrderHistory } = require('../models');
const {
  validateCreateWorkOrder,
  validateUpdateWorkOrder,
  validateStatusUpdate,
  enforceCriticalTechnicianRule,
  enforceScheduledDateNotInPast,
  enforceAssetOutOfServiceRule,
  enforceStateTransition,
  enforceAssignedTechnicianForActiveStatus,
  VALID_TRANSITIONS,
} = require('../validators/businessRules');

const detailIncludes = [
  { model: Asset, as: 'Asset' },
  { model: Technician, as: 'Technician' },
  {
    model: WorkOrderHistory,
    as: 'statusHistory',
    separate: true,
    order: [['changedAt', 'ASC']],
  },
];

const localDate = () => {
  const today = new Date();
  return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
};

const invalidTransition = (res, from, to) => res.status(400).json({
  success: false,
  error: { message: 'Business rule violation', details: `Cannot transition from ${from} to ${to}.` },
});

const invalidAssignment = (res, status) => res.status(400).json({
  success: false,
  error: {
    message: 'Business rule violation',
    details: `${status} work orders must have an assigned technician.`,
  },
});

// POST /api/work-orders
router.post(
  '/',
  validateCreateWorkOrder,
  enforceCriticalTechnicianRule,
  enforceScheduledDateNotInPast,
  enforceAssetOutOfServiceRule,
  enforceAssignedTechnicianForActiveStatus,
  async (req, res, next) => {
    let transaction;
    try {
      const data = { ...req.body };
      const initialStatus = data.status || (data.assignedTechnicianId ? 'ASSIGNED' : 'OPEN');
      if (!['OPEN', 'ASSIGNED'].includes(initialStatus)) {
        return res.status(400).json({
          success: false,
          error: { message: 'A work order must be created as OPEN or ASSIGNED.', details: null },
        });
      }
      if (initialStatus === 'ASSIGNED' && !data.assignedTechnicianId) {
        return invalidAssignment(res, initialStatus);
      }
      data.status = initialStatus;
      data.createdDate = data.createdDate || localDate();

      transaction = await sequelize.transaction();
      const workOrder = await WorkOrder.create(data, { transaction });
      await WorkOrderHistory.create({
        workOrderId: workOrder.id,
        fromStatus: null,
        toStatus: initialStatus,
      }, { transaction });
      await transaction.commit();

      const created = await WorkOrder.findByPk(workOrder.id, { include: detailIncludes });
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      if (transaction && !transaction.finished) await transaction.rollback();
      next(err);
    }
  },
);

// GET /api/work-orders?status=...&priority=...&asset_id=...&technician_id=...
router.get('/', async (req, res, next) => {
  try {
    const {
      status, priority, maintenanceType, assetId, technicianId,
      asset_id, technician_id, q, startDate, endDate, dateFrom, dateTo,
      page = 1, limit = 10,
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (maintenanceType) where.maintenanceType = maintenanceType;
    const effectiveAssetId = asset_id ?? assetId;
    const effectiveTechnicianId = technician_id ?? technicianId;
    if (effectiveAssetId) where.assetId = effectiveAssetId;
    if (effectiveTechnicianId) where.assignedTechnicianId = effectiveTechnicianId;

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      where[Op.or] = [
        { workOrderNumber: { [Op.like]: term } },
        { description: { [Op.like]: term } },
        { '$Asset.assetId$': { [Op.like]: term } },
        { '$Technician.name$': { [Op.like]: term } },
      ];
    }

    const lowerDate = startDate || dateFrom;
    const upperDate = endDate || dateTo;
    if (lowerDate || upperDate) {
      where.scheduledDate = {};
      if (lowerDate) where.scheduledDate[Op.gte] = lowerDate;
      if (upperDate) where.scheduledDate[Op.lte] = upperDate;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const { rows, count } = await WorkOrder.findAndCountAll({
      where,
      include: [
        { model: Asset, as: 'Asset' },
        { model: Technician, as: 'Technician' },
      ],
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    return res.json({
      success: true,
      data: rows,
      pagination: { page: pageNum, limit: limitNum, total: count, totalPages: Math.ceil(count / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/work-orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findByPk(req.params.id, { include: detailIncludes });
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        error: { message: 'Work order not found', details: null },
      });
    }
    return res.json({ success: true, data: workOrder });
  } catch (err) {
    next(err);
  }
});

// PUT /api/work-orders/:id
router.put(
  '/:id',
  validateUpdateWorkOrder,
  enforceCriticalTechnicianRule,
  enforceStateTransition,
  enforceAssignedTechnicianForActiveStatus,
  enforceAssetOutOfServiceRule,
  async (req, res, next) => {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const workOrder = await WorkOrder.findByPk(req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!workOrder) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: { message: 'Work order not found', details: null } });
      }

      const previousStatus = workOrder.status;
      const updateData = { ...req.body };
      // Assigning an OPEN work order advances it to ASSIGNED in the same update.
      if (previousStatus === 'OPEN' && updateData.assignedTechnicianId && !updateData.status) {
        updateData.status = 'ASSIGNED';
      }

      if (
        updateData.status && updateData.status !== previousStatus &&
        !(VALID_TRANSITIONS[previousStatus] || []).includes(updateData.status)
      ) {
        await transaction.rollback();
        return invalidTransition(res, previousStatus, updateData.status);
      }

      const effectiveTechnicianId = Object.prototype.hasOwnProperty.call(updateData, 'assignedTechnicianId')
        ? updateData.assignedTechnicianId
        : workOrder.assignedTechnicianId;
      const effectivePriority = updateData.priority || workOrder.priority;
      const effectiveStatus = updateData.status || previousStatus;
      if (effectivePriority === 'CRITICAL' && !effectiveTechnicianId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: { message: 'CRITICAL priority work orders must have an assigned technician.', details: null },
        });
      }
      if (['ASSIGNED', 'IN_PROGRESS'].includes(effectiveStatus) && !effectiveTechnicianId) {
        await transaction.rollback();
        return invalidAssignment(res, effectiveStatus);
      }
      if (
        updateData.status === 'COMPLETED' &&
        previousStatus !== 'COMPLETED' &&
        !updateData.completedDate
      ) {
        updateData.completedDate = localDate();
      }

      await workOrder.update(updateData, { transaction });
      if (updateData.status && updateData.status !== previousStatus) {
        await WorkOrderHistory.create({
          workOrderId: workOrder.id,
          fromStatus: previousStatus,
          toStatus: updateData.status,
        }, { transaction });
      }
      await transaction.commit();

      const updated = await WorkOrder.findByPk(workOrder.id, { include: detailIncludes });
      return res.json({ success: true, data: updated });
    } catch (err) {
      if (transaction && !transaction.finished) await transaction.rollback();
      next(err);
    }
  },
);

// PATCH /api/work-orders/:id/status
router.patch(
  '/:id/status',
  validateStatusUpdate,
  enforceStateTransition,
  enforceAssignedTechnicianForActiveStatus,
  async (req, res, next) => {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const workOrder = await WorkOrder.findByPk(req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!workOrder) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: { message: 'Work order not found', details: null } });
      }

      const previousStatus = workOrder.status;
      const nextStatus = req.body.status;
      if (nextStatus !== previousStatus && !(VALID_TRANSITIONS[previousStatus] || []).includes(nextStatus)) {
        await transaction.rollback();
        return invalidTransition(res, previousStatus, nextStatus);
      }
      if (['ASSIGNED', 'IN_PROGRESS'].includes(nextStatus) && !workOrder.assignedTechnicianId) {
        await transaction.rollback();
        return invalidAssignment(res, nextStatus);
      }

      const updateData = { status: nextStatus };
      if (nextStatus === 'COMPLETED' && previousStatus !== 'COMPLETED') {
        updateData.completedDate = localDate();
      }
      await workOrder.update(updateData, { transaction });
      if (nextStatus !== previousStatus) {
        await WorkOrderHistory.create({
          workOrderId: workOrder.id,
          fromStatus: previousStatus,
          toStatus: nextStatus,
        }, { transaction });
      }
      await transaction.commit();

      const updated = await WorkOrder.findByPk(workOrder.id, { include: detailIncludes });
      return res.json({ success: true, data: updated });
    } catch (err) {
      if (transaction && !transaction.finished) await transaction.rollback();
      next(err);
    }
  },
);

module.exports = router;
