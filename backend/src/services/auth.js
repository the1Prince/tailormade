import jwt from 'jsonwebtoken';
import { ActivityLog } from '../models/index.js';

const JWT_OPTS = { expiresIn: process.env.JWT_EXPIRE || '7d' };

export function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    JWT_OPTS
  );
}

export async function logActivity(userId, action, resource, resourceId, meta = {}, req) {
  await ActivityLog.create({
    userId,
    action,
    resource,
    resourceId,
    meta,
    ip: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.headers?.['user-agent'],
  });
}
