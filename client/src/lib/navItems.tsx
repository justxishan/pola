/**
 * Shared nav items for Farmer, Delivery, and Admin portal sidebars.
 * Single source of truth keeping paths and icons aligned across the application.
 */
import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Package,
  ShoppingBag,
  MapPin,
  Wallet,
  Radar,
  Truck,
  DollarSign,
  Calendar,
  Navigation,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Building,
  FileText,
} from 'lucide-react';

export interface NavItemDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badgeCount?: number;
}

export function getFarmerNavItems(t: Record<string, string> = {}): NavItemDef[] {
  return [
    { id: 'dashboard', label: t.dashboard    || 'Dashboard',         icon: <LayoutDashboard className="w-5 h-5" />, path: '/farmer/dashboard' },
    { id: 'farms',     label: t.myFarms      || 'My Farms',           icon: <Sprout          className="w-5 h-5" />, path: '/farmer/farms'     },
    { id: 'products',  label: t.cropListings || 'Crop Listings',      icon: <Package         className="w-5 h-5" />, path: '/farmer/products'  },
    { id: 'orders',    label: t.farmOrders   || 'Farm Orders',        icon: <ShoppingBag     className="w-5 h-5" />, path: '/farmer/orders'    },
    { id: 'hubs',      label: t.hubDropoffs  || 'Hub Drop-offs',      icon: <MapPin          className="w-5 h-5" />, path: '/farmer/hubs'      },
    { id: 'wallet',    label: t.earningsWallet || 'Earnings & Wallet', icon: <Wallet         className="w-5 h-5" />, path: '/wallet'           },
  ];
}

export function getDeliveryNavItems(t: Record<string, string> = {}): NavItemDef[] {
  return [
    { id: 'dashboard', label: t.dashboard || 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'radar', label: 'Available Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'active', label: 'Active Trip', icon: <Navigation className="w-5 h-5" />, path: '/delivery/active-trip' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
    { id: 'wallet', label: 'Earnings & Payouts', icon: <Wallet className="w-5 h-5" />, path: '/wallet' },
  ];
}

export function getAdminNavItems(kpis?: { pendingKycCount?: number; pendingPayoutsCount?: number; pendingFarmsCount?: number }): NavItemDef[] {
  return [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verification', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin/kyc', badgeCount: kpis?.pendingKycCount },
    { id: 'farms', label: 'Farm Approvals', icon: <Sprout className="w-5 h-5" />, path: '/admin/farms', badgeCount: kpis?.pendingFarmsCount },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <CreditCard className="w-5 h-5" />, path: '/admin/payouts', badgeCount: kpis?.pendingPayoutsCount },
    { id: 'orders', label: 'Order Oversight', icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/orders' },
    { id: 'disputes', label: 'Dispute Desk', icon: <AlertTriangle className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'hubs', label: 'Hubs & DCs', icon: <Building className="w-5 h-5" />, path: '/admin/hubs' },
    { id: 'reports', label: 'Reports Studio', icon: <FileText className="w-5 h-5" />, path: '/admin/reports' },
  ];
}
