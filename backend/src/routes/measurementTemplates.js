import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authGuard } from '../middleware/auth.js';
import { MeasurementTemplate, FIXED_MEASUREMENTS } from '../models/index.js';
import { logActivity } from '../services/auth.js';

const router = Router();

router.use(authGuard);

function tailorOnly(req, res, next) {
  if (req.user.role !== 'tailor') return res.status(403).json({ error: 'Tailor access only' });
  next();
}

router.use(tailorOnly);

router.get('/fixed', (req, res) => {
  res.json(FIXED_MEASUREMENTS);
});

router.get('/', async (req, res) => {
  const list = await MeasurementTemplate.find({ tailorId: req.user._id, deletedAt: null }).lean();
  res.json(list);
});

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('fields').isArray(),
    body('fields.*.label').trim().notEmpty(),
    body('fields.*.unit').optional().isIn(['cm', 'in']),
    body('fields.*.isCustom').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const template = await MeasurementTemplate.create({
      tailorId: req.user._id,
      name: req.body.name,
      fields: req.body.fields.map((f) => ({
        label: f.label,
        unit: f.unit || 'cm',
        isCustom: f.isCustom || false,
      })),
    });
    await logActivity(req.user._id, 'create_measurement_template', 'measurement_template', template._id, {}, req);
    res.status(201).json(template);
  }
);

router.get('/:id', async (req, res) => {
  const template = await MeasurementTemplate.findOne({
    _id: req.params.id,
    tailorId: req.user._id,
    deletedAt: null,
  }).lean();
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('fields').optional().isArray(),
  ],
  async (req, res) => {
    const template = await MeasurementTemplate.findOne({
      _id: req.params.id,
      tailorId: req.user._id,
      deletedAt: null,
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    if (req.body.name !== undefined) template.name = req.body.name;
    if (req.body.fields !== undefined) {
      template.fields = req.body.fields.map((f) => ({
        label: f.label,
        unit: f.unit || 'cm',
        isCustom: f.isCustom || false,
      }));
    }
    await template.save();
    await logActivity(req.user._id, 'update_measurement_template', 'measurement_template', template._id, {}, req);
    res.json(template);
  }
);

router.delete('/:id', async (req, res) => {
  const template = await MeasurementTemplate.findOne({
    _id: req.params.id,
    tailorId: req.user._id,
    deletedAt: null,
  });
  if (!template) return res.status(404).json({ error: 'Template not found' });
  template.deletedAt = new Date();
  await template.save();
  res.status(204).send();
});

export default router;
