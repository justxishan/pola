export enum VehicleType {
  THREE_WHEELER = 'three_wheeler', // Up to 300kg
  MOTORCYCLE = 'motorcycle', // Up to 50kg small parcel
  MINI_TRUCK = 'mini_truck', // Dimo Batta / Tata Ace, 800 - 1500kg
  MEDIUM_TRUCK = 'medium_truck', // Canter / Isuzu, 2000 - 4000kg
  HEAVY_TRUCK = 'heavy_truck', // 5000kg+
  COLD_STORAGE_TRUCK = 'cold_storage_truck', // Temperature-controlled refrigerated truck
}

export enum OwnershipType {
  OWNED = 'owned',
  LEASED = 'leased',
  RENTED = 'rented',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}
