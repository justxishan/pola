import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IParticipant {
  userId: Types.ObjectId;
  role: 'customer' | 'farmer' | 'driver' | 'admin';
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  participants: IParticipant[];
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['customer', 'farmer', 'driver', 'admin'], required: true },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    participants: [ParticipantSchema],
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: '' },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });
ConversationSchema.index({ orderId: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
