import mongoose from 'mongoose';

// System-wide fixed measurement labels (body parts)
export const FIXED_MEASUREMENTS = [
  'Bust', 'Waist', 'Hip', 'Shoulder', 'Sleeve length',
  'Neck', 'Chest', 'Back length', 'Front length', 'Inseam',
  'Outseam', 'Thigh', 'Knee', 'Ankle', 'Bicep', 'Wrist'
];

const measurementTemplateSchema = new mongoose.Schema(
  {
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Dress", "Shirt"
    fields: [{
      label: { type: String, required: true, trim: true },
      unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
      isCustom: { type: Boolean, default: false },
    }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

measurementTemplateSchema.index({ tailorId: 1, deletedAt: 1 });

export default mongoose.model('MeasurementTemplate', measurementTemplateSchema);
