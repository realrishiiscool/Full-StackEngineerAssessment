const express = require('express');
const router = express.Router();
const { Technician } = require('../models');
const {
  validateCreateTechnician,
  validateUpdateTechnician,
} = require('../validators/businessRules');

// ── POST /api/technicians ────────────────────────────────────────────
router.post('/', validateCreateTechnician, async (req, res, next) => {
  try {
    const technician = await Technician.create(req.body);
    return res.status(201).json({ success: true, data: technician });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/technicians ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { skill, status } = req.query;
    const where = {};

    if (skill) where.skill = skill;
    if (status) where.status = status;

    const technicians = await Technician.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.json({ success: true, data: technicians });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/technicians/:id ─────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const technician = await Technician.findByPk(req.params.id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: { message: 'Technician not found', details: null },
      });
    }
    return res.json({ success: true, data: technician });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/technicians/:id ─────────────────────────────────────────
router.put('/:id', validateUpdateTechnician, async (req, res, next) => {
  try {
    const technician = await Technician.findByPk(req.params.id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: { message: 'Technician not found', details: null },
      });
    }
    await technician.update(req.body);
    return res.json({ success: true, data: technician });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
