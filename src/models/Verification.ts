import mongoose, { Schema, models } from 'mongoose';

const VerificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    documentName: { type: String, required: true },
    fileBase64: { type: String },
    squadTransactionRef: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: { type: String, enum: ['pending', 'processing', 'complete', 'error'], default: 'pending' },
    verdict: { type: String, enum: ['AUTHENTIC', 'SUSPICIOUS', 'FAKE', null], default: null },
    trustScore: { type: Number, min: 0, max: 100, default: null },
    flags: { type: [String], default: [] },
    passedChecks: { type: [String], default: [] },
    summary: { type: String, default: '' },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const Verification = models.Verification || mongoose.model('Verification', VerificationSchema);

export default Verification;
