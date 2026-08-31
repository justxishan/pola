import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  QualityGrade,
  UnitOfSale,
} from '@pola/shared';

export interface IOrderItem {
  productId: Types.ObjectId;
  farmerId: Types.ObjectId;
  farmId: Types.ObjectId;
  productName: string;
  category: string;
  unit: UnitOfSale;
  quantityOrdered: number;
  quantityCollected?: number;
  unitPrice: number; // LKR agreed unit price
  subtotal: number; // quantityOrdered * unitPrice

  // Quality grading adjustments
  selfDeclaredGrade: QualityGrade;
  inspectedGrade?: QualityGrade;
  gradeMultiplierApplied?: number;
  finalPrice?: number;

  collectorId?: Types.ObjectId;
  collectorCommissionLkr?: number;
  platformCommissionLkr?: number;
  farmerPayoutLkr?: number;
}

export interface IOrderTimelineEvent {
  status: OrderStatus;
  timestamp: Date;
  updatedBy?: Types.ObjectId;
  note?: string;
  location?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string; // e.g. "POLA-20260828-8921"
  customerId: Types.ObjectId;
  customerType: 'b2c' | 'b2b';
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paypalOrderId?: string;
  paypalCaptureId?: string;

  items: IOrderItem[];

  // Logistics routing
  assignedDcId: Types.ObjectId;
  linkedVillageHubId?: Types.ObjectId;
  leg1DriverId?: Types.ObjectId;
  leg2DriverId?: Types.ObjectId;
  leg2VehicleId?: Types.ObjectId;

  // Delivery & Billing
  deliveryAddress: {
    province: string;
    district: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
    gps?: {
      latitude: number;
      longitude: number;
    };
  };
  billingAddress?: {
    province: string;
    district: string;
    addressLine1: string;
    city: string;
  };
  recipientName: string;
  recipientPhone: string;
  deliveryInstructions?: string;

  // Financial Breakdown (in LKR)
  itemsTotal: number;
  platformFeeTotal: number;
  collectorCommissionTotal: number;
  leg1DeliveryFee: number;
  leg2DeliveryFee: number;
  totalDeliveryFee: number;
  grandTotal: number; // Customer total paid

  // Payout splits snapshot
  farmerTotalPayout: number;
  deliveryTotalPayout: number;

  // Proof of Delivery & Security
  handoverOtp?: string; // 6-digit delivery confirmation OTP
  proofOfDeliveryPhoto?: string;
  deliverySignature?: string;
  deliveredAt?: Date;

  // Cancellation & Dispute
  cancellationReason?: string;
  cancelledBy?: Types.ObjectId;
  cancelledAt?: Date;

  timeline: IOrderTimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    quantityOrdered: { type: Number, required: true, min: 0.1 },
    quantityCollected: { type: Number },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },

    selfDeclaredGrade: { type: String, enum: Object.values(QualityGrade), default: QualityGrade.GRADE_A },
    inspectedGrade: { type: String, enum: Object.values(QualityGrade) },
    gradeMultiplierApplied: { type: Number, default: 1.0 },
    finalPrice: { type: Number },

    collectorId: { type: Schema.Types.ObjectId, ref: 'User' },
    collectorCommissionLkr: { type: Number, default: 0 },
    platformCommissionLkr: { type: Number, default: 0 },
    farmerPayoutLkr: { type: Number, default: 0 },
  },
  { _id: false }
);

const TimelineEventSchema = new Schema<IOrderTimelineEvent>(
  {
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String },
    location: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerType: { type: String, enum: ['b2c', 'b2b'], default: 'b2c' },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.PAYPAL,
    },
    paypalOrderId: { type: String, sparse: true },
    paypalCaptureId: { type: String, sparse: true },

    items: [OrderItemSchema],

    assignedDcId: { type: Schema.Types.ObjectId, ref: 'DistributionCenter', required: true, index: true },
    linkedVillageHubId: { type: Schema.Types.ObjectId, ref: 'VillageHub' },
    leg1DriverId: { type: Schema.Types.ObjectId, ref: 'User' },
    leg2DriverId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    leg2VehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },

    deliveryAddress: {
      province: { type: String, required: true },
      district: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      postalCode: { type: String },
      gps: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    billingAddress: {
      province: { type: String },
      district: { type: String },
      addressLine1: { type: String },
      city: { type: String },
    },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    deliveryInstructions: { type: String },

    itemsTotal: { type: Number, required: true },
    platformFeeTotal: { type: Number, required: true, default: 0 },
    collectorCommissionTotal: { type: Number, required: true, default: 0 },
    leg1DeliveryFee: { type: Number, default: 0 },
    leg2DeliveryFee: { type: Number, default: 0 },
    totalDeliveryFee: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    farmerTotalPayout: { type: Number, default: 0 },
    deliveryTotalPayout: { type: Number, default: 0 },

    handoverOtp: { type: String },
    proofOfDeliveryPhoto: { type: String },
    deliverySignature: { type: String },
    deliveredAt: { type: Date },

    cancellationReason: { type: String },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },

    timeline: [TimelineEventSchema],
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1, status: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
