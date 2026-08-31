import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  adminEmail: string;
  adminRole: string;
  action: string; // e.g. "KYC_APPROVED", "ORDER_FORCE_DISPATCHED", "WITHDRAWAL_PROCESSED", "CONFIG_UPDATED"
  targetEntity: string; // e.g. "User", "Order", "Wallet", "Product", "SystemConfig"
  targetId?: string;
  details?: any; // JSON diff or context metadata
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminEmail: { type: String, required: true },
    adminRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetEntity: { type: String, required: true, index: true },
    targetId: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1, action: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
