import mongoose from 'mongoose';

export const TICKET_STATUS = [
  'draft', 'on_hold', 'in_progress', 'ready_for_fitting',
  'completed', 'collected', 'cancelled'
];

export const PAYMENT_STATUS = ['yet_to_be_paid', 'part_payment', 'fully_paid'];

const paymentRecordSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  paidAt: { type: Date, required: true },
  note: { type: String },
}, { _id: true });

const sewingTicketSchema = new mongoose.Schema(
  {
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    ticketNumber: { type: String, trim: true },
    status: { type: String, enum: TICKET_STATUS, default: 'draft' },
    dueDate: { type: Date },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'NGN' },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'yet_to_be_paid' },
    amountPaid: { type: Number, default: 0 },
    payments: [paymentRecordSchema],
    measurements: mongoose.Schema.Types.Mixed, // { "Bust": 90, "Waist": 70, customField: 100 }
    measurementTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'MeasurementTemplate' },
    fabricImageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FabricImage' }],
    notes: { type: String },
    deletedAt: { type: Date, default: null },
    // Sync for offline-first
    updatedAtServer: { type: Date },
    localId: { type: String }, // client-generated id before sync
  },
  { timestamps: true }
);

sewingTicketSchema.index({ tailorId: 1, deletedAt: 1 });
sewingTicketSchema.index({ tailorId: 1, dueDate: 1 });
sewingTicketSchema.index({ tailorId: 1, status: 1 });
sewingTicketSchema.index({ localId: 1, tailorId: 1 });

export default mongoose.model('SewingTicket', sewingTicketSchema);
