import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import clientRoutes from './routes/clients.js';
import ticketRoutes from './routes/tickets.js';
import measurementTemplateRoutes from './routes/measurementTemplates.js';
import uploadRoutes from './routes/uploads.js';
import gdprRoutes from './routes/gdpr.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    process.env.ADMIN_WEB_URL,
    process.env.FRONTEND_URL,
    /localhost/,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests' },
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/measurement-templates', measurementTemplateRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  if (err.message?.includes('Only images')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
