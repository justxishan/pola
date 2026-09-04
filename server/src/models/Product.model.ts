import mongoose, { Document, Schema, Types } from 'mongoose';
import { ProductCategory, UnitOfSale, QualityGrade } from '@pola/shared';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  farmerId: Types.ObjectId;
  farmId: Types.ObjectId;
  district?: string;
  productName: string;
  category: ProductCategory;
  variety?: string;
  unit: UnitOfSale;
  basePricePerUnit: number; // LKR
  availableQuantity: number;
  minOrderQuantity: number; // For B2C (usually 1) and B2B MOQ
  b2bPricingTiers: Array<{
    minQuantity: number;
    maxQuantity?: number;
    unitPrice: number;
  }>;
  selfDeclaredGrade: QualityGrade;
  isOrganic: boolean;
  requiresColdChain: boolean;
  seasonTag?: 'maha' | 'yala' | 'year_round';
  harvestDate?: Date;
  shelfLifeDays?: number;
  images: string[];
  description?: string;
  status: 'draft' | 'pending_verification' | 'active' | 'out_of_stock' | 'delisted';
  viewsCount: number;
  totalSoldQuantity: number;
  averageRating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    district: { type: String, trim: true, index: true },
    productName: { type: String, required: true, trim: true, index: 'text' },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: true,
      index: true,
    },
    variety: { type: String, trim: true },
    unit: {
      type: String,
      enum: Object.values(UnitOfSale),
      required: true,
      default: UnitOfSale.KG,
    },
    basePricePerUnit: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    minOrderQuantity: { type: Number, default: 1, min: 1 },
    b2bPricingTiers: [
      {
        minQuantity: { type: Number, required: true },
        maxQuantity: { type: Number },
        unitPrice: { type: Number, required: true },
      },
    ],
    selfDeclaredGrade: {
      type: String,
      enum: Object.values(QualityGrade),
      default: QualityGrade.GRADE_A,
    },
    isOrganic: { type: Boolean, default: false, index: true },
    requiresColdChain: { type: Boolean, default: false, index: true },
    seasonTag: {
      type: String,
      enum: ['maha', 'yala', 'year_round'],
      default: 'year_round',
    },
    harvestDate: { type: Date },
    shelfLifeDays: { type: Number },
    images: [{ type: String }],
    description: { type: String },
    status: {
      type: String,
      enum: ['draft', 'pending_verification', 'active', 'out_of_stock', 'delisted'],
      default: 'pending_verification',
      index: true,
    },
    viewsCount: { type: Number, default: 0 },
    totalSoldQuantity: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for frontend compatibility
ProductSchema.virtual('title').get(function () {
  return this.productName;
});
ProductSchema.virtual('pricePerUnit').get(function () {
  return this.basePricePerUnit;
});
ProductSchema.virtual('pricingTiers').get(function () {
  return this.b2bPricingTiers;
});
ProductSchema.virtual('season').get(function () {
  return this.seasonTag;
});
ProductSchema.virtual('qualityGrade').get(function () {
  return this.selfDeclaredGrade;
});
ProductSchema.virtual('isActive').get(function () {
  return this.status === 'active';
});

ProductSchema.index({ category: 1, status: 1, basePricePerUnit: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
