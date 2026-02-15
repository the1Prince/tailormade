import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authGuard, adminOnly } from '../middleware/auth.js';
import { User, Client, SewingTicket, ActivityLog } from '../models/index.js';

const router = Router();

router.use(authGuard);
router.use(adminOnly);

// Dashboard KPIs
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalTailors,
      activeTailors,
      suspendedTailors,
      totalClients,
      totalTickets,
      ticketsByStatus,
      ticketsDueSoon,
      recentSignups,
    ] = await Promise.all([
      User.countDocuments({ role: 'tailor', deletedAt: null }),
      User.countDocuments({ role: 'tailor', deletedAt: null, isSuspended: false }),
      User.countDocuments({ role: 'tailor', isSuspended: true, deletedAt: null }),
      Client.countDocuments({ deletedAt: null }),
      SewingTicket.countDocuments({ deletedAt: null }),
      SewingTicket.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      SewingTicket.countDocuments({
        deletedAt: null,
        status: { $nin: ['cancelled', 'collected'] },
        dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      }),
      User.find({ role: 'tailor', deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('username name email createdAt lastActiveAt')
        .lean(),
    ]);

    const statusMap = Object.fromEntries(ticketsByStatus.map((s) => [s._id, s.count]));

    res.json({
      kpis: {
        totalTailors,
        activeTailors,
        suspendedTailors,
        totalClients,
        totalTickets,
        ticketsDueSoon,
      },
      ticketsByStatus: statusMap,
      recentSignups,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Dashboard failed' });
  }
});

// User management
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20, suspended, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const q = { role: 'tailor', deletedAt: null };
  if (suspended === 'true') q.isSuspended = true;
  if (suspended === 'false') q.isSuspended = false;
  if (search) {
    const re = new RegExp(search, 'i');
    q.$or = [
      { username: re },
      { name: re },
      { email: re },
    ];
  }
  const [users, total] = await Promise.all([
    User.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-password').lean(),
    User.countDocuments(q),
  ]);
  res.json({ users, total, page: Number(page), limit: Number(limit) });
});

router.get('/users/:id', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'tailor' })
    .select('-password')
    .lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const [clientCount, ticketCount, activities] = await Promise.all([
    Client.countDocuments({ tailorId: user._id, deletedAt: null }),
    SewingTicket.countDocuments({ tailorId: user._id, deletedAt: null }),
    ActivityLog.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  res.json({ ...user, clientCount, ticketCount, activities });
});

router.patch(
  '/users/:id/suspend',
  [body('reason').optional().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const user = await User.findOne({ _id: req.params.id, role: 'tailor', deletedAt: null });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspendedReason = req.body.reason || '';
    await user.save();
    res.json({ id: user._id, isSuspended: true });
  }
);

router.patch('/users/:id/unsuspend', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'tailor', deletedAt: null });
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isSuspended = false;
  user.suspendedAt = undefined;
  user.suspendedReason = undefined;
  await user.save();
  res.json({ id: user._id, isSuspended: false });
});

router.delete('/users/:id', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'tailor', deletedAt: null });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const now = new Date();
  user.deletedAt = now;
  user.username = `deleted_${user._id}`;
  user.email = null;
  user.password = null;
  user.name = 'Deleted User';
  user.isSuspended = true;
  await user.save();
  res.status(204).send();
});

// Activity (all or per user)
router.get('/activity', async (req, res) => {
  const { userId, page = 1, limit = 50 } = req.query;
  const q = {};
  if (userId) q.userId = userId;
  const [activities, total] = await Promise.all([
    ActivityLog.find(q)
      .populate('userId', 'username name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    ActivityLog.countDocuments(q),
  ]);
  res.json({ activities, total, page: Number(page), limit: Number(limit) });
});

export default router;
