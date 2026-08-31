export interface GpsCoordinate {
  latitude: number;
  longitude: number;
}

export interface Address {
  province: string;
  district: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  gps?: GpsCoordinate;
}

export interface BankAccountDetails {
  bankName: string;
  bankCode?: string;
  branchName: string;
  branchCode?: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface B2BPricingTier {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
