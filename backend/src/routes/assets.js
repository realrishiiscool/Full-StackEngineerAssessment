const express = require('express');
const router = express.Router();
const { Asset, WorkOrder, Technician } = require('../models');
const { Op } = require('sequelize');
const {
  validateCreateAsset,
  validateUpdateAsset,
} = require('../validators/businessRules');

// ── POST /api/assets ─────────────────────────────────────────────────
router.post('/', validateCreateAsset, async (req, res, next) => {
  try {
    const asset = await Asset.create(req.body);
    return res.status(201).json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/assets ──────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { assetType, status, manufacturer } = req.query;
    const where = {};

    if (assetType) where.assetType = assetType;
    if (status) where.status = status;
    if (manufacturer) where.manufacturer = { [Op.like]: `%${manufacturer}%` };

    const assets = await Asset.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.json({ success: true, data: assets });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/assets/:id ──────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { message: 'Asset not found', details: null },
      });
    }
    return res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/assets/:id ─────────────────────────────────────────────
router.put('/:id', validateUpdateAsset, async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { message: 'Asset not found', details: null },
      });
    }
    await asset.update(req.body);
    return res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/assets/:id/work-orders ──────────────────────────────────
router.get('/:id/work-orders', async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { message: 'Asset not found', details: null },
      });
    }

    const workOrders = await WorkOrder.findAll({
      where: { assetId: req.params.id },
      include: [
        { model: Technician, as: 'Technician' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ success: true, data: workOrders });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
