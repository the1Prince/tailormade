import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authGuard } from '../middleware/auth.js';
import { SewingTicket, TICKET_STATUS, PAYMENT_STATUS } from '../models/index.js';
import { logActivity } from '../services/auth.js';

const router = Router();

router.use(authGuard);

function tailorOnly(req, res, next) {
  if (req.user.role !== 'tailor') return res.status(403).json({ error: 'Tailor access only' });
  next();
}

router.use(tailorOnly);

router.get('/', async (req, res) => {
  const { status, clientId, from, to } = req.query;
  const q = { tailorId: req.user._id, deletedAt: null };
  if (status) q.status = status;
  if (clientId) q.clientId = clientId;
  if (from || to) {
    q.dueDate = {};
    if (from) q.dueDate.$gte = new Date(from);
    if (to) q.dueDate.$lte = new Date(to);
  }
  const list = await SewingTicket.find(q)
    .populate('clientId', 'name phone email')
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();
  res.json(list);
});

router.post(
  '/',
  [
    body('clientId').isMongoId(),
    body('ticketNumber').optional().trim(),
    body('status').optional().isIn(TICKET_STATUS),
    body('dueDate').optional().isISO8601(),
    body('totalAmount').optional().isFloat({ min: 0 }),
    body('currency').optional().trim(),
    body('paymentStatus').optional().isIn(PAYMENT_STATUS),
    body('amountPaid').optional().isFloat({ min: 0 }),
    body('payments').optional().isArray(),
    body('payments.*.amount').optional().isFloat({ min: 0 }),
    body('payments.*.paidAt').optional().isISO8601(),
    body('payments.*.note').optional().trim(),
    body('measurements').optional().isObject(),
    body('measurementTemplateId').optional().isMongoId(),
    body('fabricImageIds').optional().isArray(),
    body('fabricImageIds.*').isMongoId(),
    body('notes').optional().trim(),
    body('localId').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const payload = { ...req.body, tailorId: req.user._id };
      if (payload.fabricImageIds && payload.fabricImageIds.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 fabric images per ticket' });
      }
      const ticket = await SewingTicket.create(payload);
      ticket.updatedAtServer = ticket.updatedAt;
      await ticket.save();
      await logActivity(req.user._id, 'create_ticket', 'sewing_ticket', ticket._id, {}, req);
      const populated = await SewingTicket.findById(ticket._id).populate('clientId', 'name phone email').lean();
      res.status(201).json(populated);
    } catch (e) {
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  }
);

router.get('/:id', async (req, res) => {
  const ticket = await SewingTicket.findOne({
    _id: req.params.id,
    tailorId: req.user._id,
    deletedAt: null,
  })
    .populate('clientId', 'name phone email address')
    .lean();
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

router.patch(
  '/:id',
  [
    body('clientId').optional().isMongoId(),
    body('ticketNumber').optional().trim(),
    body('status').optional().isIn(TICKET_STATUS),
    body('dueDate').optional().isISO8601(),
    body('totalAmount').optional().isFloat({ min: 0 }),
    body('currency').optional().trim(),
    body('paymentStatus').optional().isIn(PAYMENT_STATUS),
    body('amountPaid').optional().isFloat({ min: 0 }),
    body('payments').optional().isArray(),
    body('payments.*.amount').optional().isFloat({ min: 0 }),
    body('payments.*.paidAt').optional().isISO8601(),
    body('payments.*.note').optional().trim(),
    body('measurements').optional().isObject(),
    body('measurementTemplateId').optional().isMongoId(),
    body('fabricImageIds').optional().isArray(),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    const ticket = await SewingTicket.findOne({
      _id: req.params.id,
      tailorId: req.user._id,
      deletedAt: null,
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const allowed = [
      'clientId', 'ticketNumber', 'status', 'dueDate', 'totalAmount', 'currency',
      'paymentStatus', 'amountPaid', 'payments', 'measurements', 'measurementTemplateId',
      'fabricImageIds', 'notes',
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) ticket[k] = req.body[k];
    });
    if (ticket.fabricImageIds && ticket.fabricImageIds.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 fabric images per ticket' });
    }
    ticket.updatedAtServer = new Date();
    await ticket.save();
    await logActivity(req.user._id, 'update_ticket', 'sewing_ticket', ticket._id, {}, req);
    const populated = await SewingTicket.findById(ticket._id).populate('clientId', 'name phone email').lean();
    res.json(populated);
  }
);

router.delete('/:id', async (req, res) => {
  const ticket = await SewingTicket.findOne({
    _id: req.params.id,
    tailorId: req.user._id,
    deletedAt: null,
  });
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  ticket.deletedAt = new Date();
  await ticket.save();
  await logActivity(req.user._id, 'delete_ticket', 'sewing_ticket', ticket._id, {}, req);
  res.status(204).send();
});

export default router;
