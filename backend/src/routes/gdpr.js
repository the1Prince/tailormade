import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { User, Client, SewingTicket, MeasurementTemplate, ActivityLog } from '../models/index.js';
import { getBucket } from '../services/storage.js';
import mongoose from 'mongoose';

const router = Router();

router.use(authGuard);

// Export all user data (GDPR Art. 20)
router.get('/export', async (req, res) => {
  const userId = req.user._id;
  try {
    const [user, clients, tickets, templates, activities] = await Promise.all([
      User.findById(userId).select('-password').lean(),
      Client.find({ tailorId: userId, deletedAt: null }).lean(),
      SewingTicket.find({ tailorId: userId, deletedAt: null })
        .populate('clientId', 'name phone email')
        .lean(),
      MeasurementTemplate.find({ tailorId: userId, deletedAt: null }).lean(),
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(1000).lean(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user ? {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        consentTermsAt: user.consentTermsAt,
        consentMarketing: user.consentMarketing,
      } : null,
      clients: clients.map((c) => ({
        id: c._id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        notes: c.notes,
        createdAt: c.createdAt,
      })),
      sewingTickets: tickets.map((t) => ({
        id: t._id,
        client: t.clientId,
        ticketNumber: t.ticketNumber,
        status: t.status,
        dueDate: t.dueDate,
        totalAmount: t.totalAmount,
        currency: t.currency,
        paymentStatus: t.paymentStatus,
        amountPaid: t.amountPaid,
        payments: t.payments,
        measurements: t.measurements,
        notes: t.notes,
        createdAt: t.createdAt,
      })),
      measurementTemplates: templates,
      recentActivity: activities,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=tailormade-data-export.json');
    res.send(JSON.stringify(exportData, null, 2));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Delete account and all related data (GDPR Art. 17)
router.delete('/delete-account', async (req, res) => {
  const userId = req.user._id;
  try {
    await mongoose.startSession().then(async (session) => {
      await session.withTransaction(async () => {
        const now = new Date();
        await User.findByIdAndUpdate(userId, {
          deletedAt: now,
          username: `deleted_${userId}`,
          email: null,
          password: null,
          name: 'Deleted User',
          isSuspended: true,
        }).session(session);

        await Client.updateMany({ tailorId: userId }, { deletedAt: now }).session(session);
        await SewingTicket.updateMany({ tailorId: userId }, { deletedAt: now }).session(session);
        await MeasurementTemplate.updateMany({ tailorId: userId }, { deletedAt: now }).session(session);
        // ActivityLog retained for legal/compliance with anonymised reference if needed
      });
    });

    // Optional: delete fabric images from GridFS (metadata may still reference tailorId)
    const bucket = getBucket();
    const files = await bucket.find({ 'metadata.tailorId': userId.toString() }).toArray();
    for (const f of files) {
      await bucket.delete(f._id);
    }

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Account deletion failed' });
  }
});

export default router;
