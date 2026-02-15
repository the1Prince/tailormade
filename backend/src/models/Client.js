import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    notes: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

clientSchema.index({ tailorId: 1, deletedAt: 1 });
clientSchema.index({ tailorId: 1, name: 1 });

export default mongoose.model('Client', clientSchema);
