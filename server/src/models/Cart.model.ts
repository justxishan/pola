import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId;
  title: string;
  pricePerUnit: number;
  unit: string;
  quantity: number;
  image?: string;
  farmerName?: string;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    quantity: { type: Number, required: true, min: 0.1 },
    image: { type: String },
    farmerName: { type: String },
    minOrderQuantity: { type: Number, default: 1 },
    maxOrderQuantity: { type: Number },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
