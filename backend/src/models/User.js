import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 2 },
    email: { type: String, sparse: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    name: { type: String, trim: true },
    role: { type: String, enum: ['tailor', 'admin'], default: 'tailor' },
    // Account state
    isSuspended: { type: Boolean, default: false },
    suspendedAt: Date,
    suspendedReason: String,
    lastActiveAt: Date,
    // GDPR
    consentMarketing: { type: Boolean, default: false },
    consentTermsAt: Date,
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ username: 1, deletedAt: 1 });
userSchema.index({ email: 1, deletedAt: 1 });
userSchema.index({ role: 1, deletedAt: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
