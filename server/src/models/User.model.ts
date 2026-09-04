import mongoose, { Document, Schema, Types } from 'mongoose';
import { Role, VerificationStatus } from '@pola/shared';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  secondaryRoles?: Role[];
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  preferredLanguage: 'en' | 'si' | 'ta';
  themePreference?: 'light' | 'dark' | 'system';
  assignedHubId?: Types.ObjectId;

  // Sri Lankan Identity & KYC
  nicNumber?: string;
  isOldNicFormat?: boolean;
  nicFrontImage?: string;
  nicBackImage?: string;
  selfieImage?: string;
  kycStatus: VerificationStatus;
  kycRejectionReason?: string;
  kycReviewedBy?: Types.ObjectId;
  kycReviewedAt?: Date;

  // Business & Farm Credentials (B2B / Farmer)
  businessName?: string;
  businessRegNumber?: string;
  businessRegDoc?: string;
  businessType?: 'supermarket' | 'hotel' | 'restaurant' | 'retailer' | 'exporter';

  // Bank Details for LankaPay Payouts
  bankDetails?: {
    bankName: string;
    bankCode?: string;
    branchName: string;
    branchCode?: string;
    accountNumber: string;
    accountHolderName: string;
  };

  bankAccounts?: Array<{
    _id?: Types.ObjectId;
    bankName: string;
    bankCode?: string;
    branchName: string;
    branchCode?: string;
    accountNumber: string;
    accountHolderName: string;
    isDefault: boolean;
    createdAt?: Date;
  }>;

  // Addresses
  addresses: Array<{
    _id?: Types.ObjectId;
    label: string; // "Home", "Farm", "Warehouse", "Billing", "Main Hotel Drop"
    province: string;
    district: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
    isDefault?: boolean;
    gps?: {
      latitude: number;
      longitude: number;
    };
  }>;

  // Village Collector Hierarchy
  linkedCollectorId?: Types.ObjectId; // If this farmer is managed by a Collector
  managedFarmers?: Types.ObjectId[]; // If this user is a Collector, list of farmers managed
  commissionRatePercent?: number; // Custom collector commission rate override

  // Delivery Partner Details
  deliveryRadiusKm?: number; // Radar radius (5 - 35km)
  isOnline?: boolean; // Online status for Leg-2 delivery drivers
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt?: Date;
  };

  // Auth & Security
  googleId?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  onboardingCompleted: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, sparse: true, index: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.CUSTOMER_B2C,
      required: true,
      index: true,
    },
    secondaryRoles: [{ type: String, enum: Object.values(Role) }],
    profileImage: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    preferredLanguage: { type: String, enum: ['en', 'si', 'ta'], default: 'en' },
    themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    assignedHubId: { type: Schema.Types.ObjectId, ref: 'VillageHub' },

    nicNumber: { type: String, trim: true, uppercase: true, sparse: true, index: true },
    isOldNicFormat: { type: Boolean },
    nicFrontImage: { type: String },
    nicBackImage: { type: String },
    selfieImage: { type: String },
    kycStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.UNVERIFIED,
      index: true,
    },
    kycRejectionReason: { type: String },
    kycReviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    kycReviewedAt: { type: Date },

    businessName: { type: String, trim: true },
    businessRegNumber: { type: String, trim: true },
    businessRegDoc: { type: String },
    businessType: {
      type: String,
      enum: ['supermarket', 'hotel', 'restaurant', 'retailer', 'exporter'],
    },

    bankDetails: {
      bankName: { type: String },
      bankCode: { type: String },
      branchName: { type: String },
      branchCode: { type: String },
      accountNumber: { type: String },
      accountHolderName: { type: String },
    },

    bankAccounts: [
      {
        bankName: { type: String, required: true },
        bankCode: { type: String },
        branchName: { type: String, required: true },
        branchCode: { type: String },
        accountNumber: { type: String, required: true },
        accountHolderName: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    addresses: [
      {
        label: { type: String, default: 'Primary' },
        province: { type: String },
        district: { type: String },
        addressLine1: { type: String },
        addressLine2: { type: String },
        streetAddress: { type: String },  // alias kept for compatibility
        city: { type: String },
        postalCode: { type: String },
        contactPhone: { type: String },
        isDefault: { type: Boolean, default: false },
        gps: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
    ],

    linkedCollectorId: { type: Schema.Types.ObjectId, ref: 'User' },
    managedFarmers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commissionRatePercent: { type: Number },

    deliveryRadiusKm: { type: Number, default: 15 },
    isOnline: { type: Boolean, default: false, index: true },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      updatedAt: { type: Date },
    },

    googleId: { type: String, sparse: true },
    otpCode: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.passwordHash;
        delete ret.otpCode;
        delete ret.otpExpiresAt;
        if (ret.bankDetails?.accountNumber && ret.bankDetails.accountNumber.length > 4) {
          ret.bankDetails.accountNumber = `•••• •••• ${ret.bankDetails.accountNumber.slice(-4)}`;
        }
        if (Array.isArray(ret.bankAccounts)) {
          ret.bankAccounts = ret.bankAccounts.map((acc: any) => {
            if (acc.accountNumber && acc.accountNumber.length > 4) {
              return {
                ...acc,
                accountNumber: `•••• •••• ${acc.accountNumber.slice(-4)}`,
              };
            }
            return acc;
          });
        }
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
