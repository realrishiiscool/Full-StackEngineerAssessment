const { body, validationResult } = require('express-validator');
const { Asset, WorkOrder } = require('../models');

// ── Helper: format express-validator errors ──────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      },
    });
  }
  next();
};

// ── Valid state transitions map ──────────────────────────────────────
const VALID_TRANSITIONS = {
  OPEN: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

// ── Asset validators ─────────────────────────────────────────────────
const validateCreateAsset = [
  body('assetId').trim().notEmpty().withMessage('assetId is required'),
  body('assetType')
    .notEmpty().withMessage('assetType is required')
    .isIn(['MECHANICAL', 'ELECTRICAL', 'HYDRAULIC', 'PNEUMATIC', 'ELECTRONIC'])
    .withMessage('assetType must be one of: MECHANICAL, ELECTRICAL, HYDRAULIC, PNEUMATIC, ELECTRONIC'),
  body('manufacturer').trim().notEmpty().withMessage('manufacturer is required'),
  body('model').trim().notEmpty().withMessage('model is required'),
  body('serialNumber').trim().notEmpty().withMessage('serialNumber is required'),
  body('usageHours').optional().isFloat({ min: 0 }).withMessage('usageHours must be a non-negative number'),
  body('usageCycles').optional().isInt({ min: 0 }).withMessage('usageCycles must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'])
    .withMessage('status must be one of: ACTIVE, INACTIVE, UNDER_MAINTENANCE, OUT_OF_SERVICE'),
  handleValidationErrors,
];

const validateUpdateAsset = [
  body('assetId').optional().trim().notEmpty().withMessage('assetId cannot be empty'),
  body('assetType')
    .optional()
    .isIn(['MECHANICAL', 'ELECTRICAL', 'HYDRAULIC', 'PNEUMATIC', 'ELECTRONIC'])
    .withMessage('assetType must be one of: MECHANICAL, ELECTRICAL, HYDRAULIC, PNEUMATIC, ELECTRONIC'),
  body('manufacturer').optional().trim().notEmpty().withMessage('manufacturer cannot be empty'),
  body('model').optional().trim().notEmpty().withMessage('model cannot be empty'),
  body('serialNumber').optional().trim().notEmpty().withMessage('serialNumber cannot be empty'),
  body('usageHours').optional().isFloat({ min: 0 }).withMessage('usageHours must be a non-negative number'),
  body('usageCycles').optional().isInt({ min: 0 }).withMessage('usageCycles must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'])
    .withMessage('status must be one of: ACTIVE, INACTIVE, UNDER_MAINTENANCE, OUT_OF_SERVICE'),
  handleValidationErrors,
];

// ── Technician validators ────────────────────────────────────────────
const validateCreateTechnician = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('skill')
    .notEmpty().withMessage('skill is required')
    .isIn(['MECHANICAL', 'ELECTRICAL', 'PLUMBING', 'GENERAL', 'SPECIALIST'])
    .withMessage('skill must be one of: MECHANICAL, ELECTRICAL, PLUMBING, GENERAL, SPECIALIST'),
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'BUSY', 'OFF_DUTY'])
    .withMessage('status must be one of: AVAILABLE, BUSY, OFF_DUTY'),
  handleValidationErrors,
];

const validateUpdateTechnician = [
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('skill')
    .optional()
    .isIn(['MECHANICAL', 'ELECTRICAL', 'PLUMBING', 'GENERAL', 'SPECIALIST'])
    .withMessage('skill must be one of: MECHANICAL, ELECTRICAL, PLUMBING, GENERAL, SPECIALIST'),
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'BUSY', 'OFF_DUTY'])
    .withMessage('status must be one of: AVAILABLE, BUSY, OFF_DUTY'),
  handleValidationErrors,
];

// ── Work Order validators ────────────────────────────────────────────
const validateCreateWorkOrder = [
  body('workOrderNumber').trim().notEmpty().withMessage('workOrderNumber is required'),
  body('assetId').notEmpty().withMessage('assetId is required').isInt().withMessage('assetId must be an integer'),
  body('maintenanceType')
    .notEmpty().withMessage('maintenanceType is required')
    .isIn(['INSPECTION', 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'])
    .withMessage('maintenanceType must be one of: INSPECTION, PREVENTIVE, CORRECTIVE, EMERGENCY'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('priority')
    .notEmpty().withMessage('priority is required')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('priority must be one of: LOW, MEDIUM, HIGH, CRITICAL'),
  body('assignedTechnicianId')
    .optional({ nullable: true })
    .isInt().withMessage('assignedTechnicianId must be an integer'),
  body('scheduledDate')
    .notEmpty().withMessage('scheduledDate is required')
    .isISO8601({ strict: true, strictSeparator: true })
    .custom((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))
    .withMessage('scheduledDate must be a valid date (YYYY-MM-DD)'),
  body('status')
    .optional()
    .isIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('status must be one of: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED'),
  handleValidationErrors,
];

const validateUpdateWorkOrder = [
  body('workOrderNumber').optional().trim().notEmpty().withMessage('workOrderNumber cannot be empty'),
  body('assetId').optional().isInt().withMessage('assetId must be an integer'),
  body('maintenanceType')
    .optional()
    .isIn(['INSPECTION', 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'])
    .withMessage('maintenanceType must be one of: INSPECTION, PREVENTIVE, CORRECTIVE, EMERGENCY'),
  body('description').optional().trim().notEmpty().withMessage('description cannot be empty'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('priority must be one of: LOW, MEDIUM, HIGH, CRITICAL'),
  body('assignedTechnicianId')
    .optional({ nullable: true })
    .isInt().withMessage('assignedTechnicianId must be an integer'),
  body('scheduledDate')
    .optional()
    .isISO8601().withMessage('scheduledDate must be a valid date (YYYY-MM-DD)'),
  body('status')
    .optional()
    .isIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('status must be one of: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED'),
  handleValidationErrors,
];

const validateStatusUpdate = [
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('status must be one of: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED'),
  handleValidationErrors,
];

// ══════════════════════════════════════════════════════════════════════
// Business-rule middleware (async – runs AFTER express-validator pass)
// ══════════════════════════════════════════════════════════════════════

/**
 * Rule 2 – CRITICAL priority requires an assigned technician.
 * Works for both create & update.
 */
const enforceCriticalTechnicianRule = async (req, res, next) => {
  try {
    const priority = req.body.priority;
    const technicianId = req.body.assignedTechnicianId;

    // On update, we may need to check the existing record
    if (req.params.id) {
      const existing = await WorkOrder.findByPk(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { message: 'Work order not found', details: null },
        });
      }
      req._existingWorkOrder = existing; // cache for later middleware

      const effectivePriority = priority || existing.priority;
      // If technicianId is explicitly set to null or not provided and the existing is null
      const effectiveTechnician =
        req.body.hasOwnProperty('assignedTechnicianId')
          ? technicianId
          : existing.assignedTechnicianId;

      if (effectivePriority === 'CRITICAL' && !effectiveTechnician) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Business rule violation',
            details: 'CRITICAL priority work orders must have an assigned technician.',
          },
        });
      }
    } else {
      // Create path
      if (priority === 'CRITICAL' && !technicianId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Business rule violation',
            details: 'CRITICAL priority work orders must have an assigned technician.',
          },
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Rule 5 – scheduledDate cannot be in the past (creation only).
 */
const enforceScheduledDateNotInPast = (req, res, next) => {
  const { scheduledDate } = req.body;
  if (scheduledDate) {
    const today = new Date();
    const todayIso = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    // YYYY-MM-DD lexical comparison avoids UTC/local-time boundary errors.
    if (scheduledDate < todayIso) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Business rule violation',
          details: 'scheduledDate cannot be in the past.',
        },
      });
    }
  }
  next();
};

/**
 * Rule 6 – Asset OUT_OF_SERVICE cannot receive new work orders
 *          unless maintenanceType is EMERGENCY.
 * Works for both create and update (when assetId changes).
 */
const enforceAssetOutOfServiceRule = async (req, res, next) => {
  try {
    // Rule 6 applies to new orders and to an update that changes the asset or
    // maintenance type. An unrelated edit to a pre-existing order must remain possible.
    if (
      req.params.id &&
      !Object.prototype.hasOwnProperty.call(req.body, 'assetId') &&
      !Object.prototype.hasOwnProperty.call(req.body, 'maintenanceType')
    ) {
      return next();
    }

    const assetId = req.body.assetId;

    // Determine the effective assetId (for update, fall back to existing)
    let effectiveAssetId = assetId;
    if (!effectiveAssetId && req._existingWorkOrder) {
      effectiveAssetId = req._existingWorkOrder.assetId;
    }
    if (!effectiveAssetId) return next(); // nothing to check

    const asset = await Asset.findByPk(effectiveAssetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { message: 'Asset not found', details: `No asset with id ${effectiveAssetId}` },
      });
    }

    const maintenanceType = req.body.maintenanceType ||
      (req._existingWorkOrder ? req._existingWorkOrder.maintenanceType : null);

    if (asset.status === 'OUT_OF_SERVICE' && maintenanceType !== 'EMERGENCY') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Business rule violation',
          details:
            'Assets with status OUT_OF_SERVICE can only receive work orders with maintenanceType EMERGENCY.',
        },
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

/** ASSIGNED and IN_PROGRESS work must retain a technician assignment. */
const enforceAssignedTechnicianForActiveStatus = async (req, res, next) => {
  try {
    let existing = req._existingWorkOrder;
    if (!existing && req.params.id) {
      existing = await WorkOrder.findByPk(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { message: 'Work order not found', details: null },
        });
      }
      req._existingWorkOrder = existing;
    }

    const effectiveStatus = req.body.status || existing?.status || 'OPEN';
    const effectiveTechnician = Object.prototype.hasOwnProperty.call(req.body, 'assignedTechnicianId')
      ? req.body.assignedTechnicianId
      : existing?.assignedTechnicianId;

    if (['ASSIGNED', 'IN_PROGRESS'].includes(effectiveStatus) && !effectiveTechnician) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Business rule violation',
          details: `${effectiveStatus} work orders must have an assigned technician.`,
        },
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Rules 3 & 4 – Enforce valid state transitions.
 * Used by PUT (full update) and PATCH (status-only).
 */
const enforceStateTransition = async (req, res, next) => {
  try {
    const newStatus = req.body.status;
    if (!newStatus) return next(); // no status change requested

    // Get existing work order (may already be cached)
    let existing = req._existingWorkOrder;
    if (!existing) {
      existing = await WorkOrder.findByPk(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { message: 'Work order not found', details: null },
        });
      }
      req._existingWorkOrder = existing;
    }

    const currentStatus = existing.status;

    // If status isn't actually changing, allow it
    if (currentStatus === newStatus) return next();

    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Business rule violation',
          details: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.length ? allowedTransitions.join(', ') : 'none (terminal state)'}.`,
        },
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleValidationErrors,
  validateCreateAsset,
  validateUpdateAsset,
  validateCreateTechnician,
  validateUpdateTechnician,
  validateCreateWorkOrder,
  validateUpdateWorkOrder,
  validateStatusUpdate,
  enforceCriticalTechnicianRule,
  enforceScheduledDateNotInPast,
  enforceAssetOutOfServiceRule,
  enforceStateTransition,
  enforceAssignedTechnicianForActiveStatus,
  VALID_TRANSITIONS,
};
