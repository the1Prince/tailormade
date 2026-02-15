import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/index.js';
import { signToken, logActivity } from '../services/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 2, max: 32 }).matches(/^[a-z0-9_.-]+$/i).withMessage('Username: letters, numbers, . _ - only'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('email').optional().isEmail().normalizeEmail(),
    body('name').optional().trim().isLength({ max: 120 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { username, password, email, name } = req.body;
      const normalizedUsername = username.trim().toLowerCase();
      const existing = await User.findOne({
        $or: [{ username: normalizedUsername }, ...(email ? [{ email: email.toLowerCase() }] : [])],
        deletedAt: null,
      });
      if (existing) {
        return res.status(400).json({
          error: existing.username === normalizedUsername ? 'Username already taken' : 'Email already registered',
        });
      }
      const user = await User.create({
        username: normalizedUsername,
        password,
        email: email || undefined,
        name: name || normalizedUsername,
        role: 'tailor',
        consentTermsAt: new Date(),
      });
      const token = signToken(user);
      await logActivity(user._id, 'register', 'auth', null, {}, req);
      res.status(201).json({
        token,
        user: { id: user._id, username: user.username, email: user.email, name: user.name, role: user.role },
      });
    } catch (e) {
      if (e.code === 11000) return res.status(400).json({ error: 'Username already taken' });
      console.error(e);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

router.post(
  '/login',
  [
    body('usernameOrEmail').trim().notEmpty().withMessage('Username or email required'),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { usernameOrEmail, password } = req.body;
      const isEmail = usernameOrEmail.includes('@');
      const query = isEmail
        ? { email: usernameOrEmail.toLowerCase(), deletedAt: null }
        : { username: usernameOrEmail.trim().toLowerCase(), deletedAt: null };
      const user = await User.findOne(query).select('+password');
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }
      const ok = await user.comparePassword(password);
      if (!ok) return res.status(401).json({ error: 'Invalid username/email or password' });
      if (user.isSuspended) return res.status(403).json({ error: 'Account suspended' });
      user.lastActiveAt = new Date();
      await user.save({ validateBeforeSave: false });
      const token = signToken(user);
      await logActivity(user._id, 'login', 'auth', null, {}, req);
      res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email, name: user.name, role: user.role },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

export default router;
