export enum Role {
  FARMER = 'farmer',
  COLLECTOR = 'collector',
  CUSTOMER_B2C = 'customer_b2c',
  CUSTOMER_B2B = 'customer_b2b',
  DELIVERY_INDIVIDUAL = 'delivery_individual',
  DELIVERY_COMPANY = 'delivery_company',
  ADMIN_SUPER = 'admin_super',
  ADMIN_FINANCE = 'admin_finance',
  ADMIN_LOGISTICS = 'admin_logistics',
  ADMIN_SUPPORT = 'admin_support',
}

export enum UserRoleCategory {
  FARMER = 'farmer',
  CUSTOMER = 'customer',
  DELIVERY = 'delivery',
  ADMIN = 'admin',
}

export const ADMIN_ROLES = [
  Role.ADMIN_SUPER,
  Role.ADMIN_FINANCE,
  Role.ADMIN_LOGISTICS,
  Role.ADMIN_SUPPORT,
];

export const DELIVERY_ROLES = [
  Role.DELIVERY_INDIVIDUAL,
  Role.DELIVERY_COMPANY,
];

export const CUSTOMER_ROLES = [
  Role.CUSTOMER_B2C,
  Role.CUSTOMER_B2B,
];

export const FARMER_ROLES = [
  Role.FARMER,
  Role.COLLECTOR,
];
