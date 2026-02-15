import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authGuard } from '../middleware/auth.js';
import { User } from '../models/index.js';
import { logActivity } from '../services/auth.js';

const router = Router();

router.use(authGuard);

router.get('/me', (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    consentMarketing: req.user.consentMarketing,
    consentTermsAt: req.user.consentTermsAt,
  });
});

router.patch(
  '/me',
  [
    body('name').optional().trim().isLength({ max: 120 }),
    body('consentMarketing').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, consentMarketing } = req.body;
      if (name !== undefined) req.user.name = name;
      if (consentMarketing !== undefined) req.user.consentMarketing = consentMarketing;
      await req.user.save();
      await logActivity(req.user._id, 'update_profile', 'user', req.user._id, {}, req);
      res.json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        consentMarketing: req.user.consentMarketing,
      });
    } catch (e) {
      res.status(500).json({ error: 'Update failed' });
    }
  }
);

export default router;
