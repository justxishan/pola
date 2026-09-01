import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationPortal = 'customer' | 'farmer' | 'delivery' | 'admin';

export type NotificationDestinationKey =
  | 'ORDER_DETAIL'
  | 'FARMER_ORDERS'
  | 'AVAILABLE_TRIPS'
  | 'ACTIVE_TRIP'
  | 'WALLET'
  | 'KYC'
  | 'DISPUTES'
  | 'CHAT_THREAD'
  | 'PORTAL_HOME';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'order' | 'kyc' | 'wallet' | 'grading' | 'delivery' | 'dispute' | 'system' | 'message';
  portal: NotificationPortal;
  destinationKey?: NotificationDestinationKey;
  relatedId?: string;
  linkUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order', 'kyc', 'wallet', 'grading', 'delivery', 'dispute', 'system', 'message'],
      default: 'system',
    },
    portal: {
      type: String,
      enum: ['customer', 'farmer', 'delivery', 'admin'],
      default: 'customer',
      index: true,
    },
    destinationKey: {
      type: String,
      enum: [
        'ORDER_DETAIL',
        'FARMER_ORDERS',
        'AVAILABLE_TRIPS',
        'ACTIVE_TRIP',
        'WALLET',
        'KYC',
        'DISPUTES',
        'CHAT_THREAD',
        'PORTAL_HOME',
      ],
    },
    relatedId: { type: String },
    linkUrl: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, portal: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
