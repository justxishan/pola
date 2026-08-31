import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISupportTicketMessage {
  senderId: Types.ObjectId;
  senderRole: string;
  messageText: string;
  attachments?: string[];
  sentAt: Date;
}

export interface ISupportTicket extends Document {
  _id: Types.ObjectId;
  ticketNumber: string;
  userId: Types.ObjectId;
  userRole: string;
  subject: string;
  category: 'order' | 'wallet' | 'kyc' | 'app_bug' | 'dispute' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
  relatedOrderId?: Types.ObjectId;
  assignedAdminId?: Types.ObjectId;
  messages: ISupportTicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new Schema<ISupportTicketMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, required: true },
    messageText: { type: String, required: true },
    attachments: [{ type: String }],
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userRole: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['order', 'wallet', 'kyc', 'app_bug', 'dispute', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    relatedOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [TicketMessageSchema],
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>(
  'SupportTicket',
  SupportTicketSchema
);
