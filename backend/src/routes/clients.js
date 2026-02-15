import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authGuard } from '../middleware/auth.js';
import { Client } from '../models/index.js';
import { logActivity } from '../services/auth.js';

const router = Router();

router.use(authGuard);

function tailorOnly(req, res, next) {
  if (req.user.role !== 'tailor') return res.status(403).json({ error: 'Tailor access only' });
  next();
}

router.use(tailorOnly);

router.get('/', async (req, res) => {
  try {
    const list = await Client.find({ tailorId: req.user._id, deletedAt: null })
      .sort({ name: 1 })
      .lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list clients' });
  }
});

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('phone').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('address').optional().trim(),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const client = await Client.create({
        tailorId: req.user._id,
        ...req.body,
      });
      await logActivity(req.user._id, 'create_client', 'client', client._id, { name: client.name }, req);
      res.status(201).json(client);
    } catch (e) {
      res.status(500).json({ error: 'Failed to create client' });
    }
  }
);

router.get('/:id', async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    tailorId: req.user._id,
    deletedAt: null,
  }).lean();
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
});

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('address').optional().trim(),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    const client = await Client.findOne({
      _id: req.params.id,
      tailorId: req.user._id,
      deletedAt: null,
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const allowed = ['name', 'phone', 'email', 'address', 'notes'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) client[k] = req.body[k]; });
    await client.save();
    await logActivity(req.user._id, 'update_client', 'client', client._id, {}, req);
    res.json(client);
  }
);

router.delete('/:id', async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    tailorId: req.user._id,
    deletedAt: null,
  });
  if (!client) return res.status(404).json({ error: 'Client not found' });
  client.deletedAt = new Date();
  await client.save();
  await logActivity(req.user._id, 'delete_client', 'client', client._id, {}, req);
  res.status(204).send();
});

export default router;
