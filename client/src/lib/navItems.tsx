/**
 * Shared nav items for all Farmer portal pages.
 * Import from here to keep icons consistent across every farmer page.
 */
import React from 'react';
import { LayoutDashboard, Sprout, Package, ShoppingBag, MapPin, Wallet } from 'lucide-react';

export interface NavItemDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export function getFarmerNavItems(t: Record<string, string>): NavItemDef[] {
  return [
    { id: 'dashboard', label: t.dashboard    || 'Dashboard',         icon: <LayoutDashboard className="w-5 h-5" />, path: '/farmer/dashboard' },
    { id: 'farms',     label: t.myFarms      || 'My Farms',           icon: <Sprout          className="w-5 h-5" />, path: '/farmer/farms'     },
    { id: 'products',  label: t.cropListings || 'Crop Listings',      icon: <Package         className="w-5 h-5" />, path: '/farmer/products'  },
    { id: 'orders',    label: t.farmOrders   || 'Farm Orders',        icon: <ShoppingBag     className="w-5 h-5" />, path: '/farmer/orders'    },
    { id: 'hubs',      label: t.hubDropoffs  || 'Hub Drop-offs',      icon: <MapPin          className="w-5 h-5" />, path: '/farmer/hubs'      },
    { id: 'wallet',    label: t.earningsWallet || 'Earnings & Wallet', icon: <Wallet         className="w-5 h-5" />, path: '/wallet'           },
  ];
}

export function getDeliveryNavItems(t: Record<string, string>): NavItemDef[] {
  return [
    { id: 'dashboard',   label: t.dashboard       || 'Dashboard',         icon: <LayoutDashboard className="w-5 h-5" />, path: '/delivery/dashboard'  },
    { id: 'trips',       label: t.availableTrips  || 'Available Trips',    icon: <Package         className="w-5 h-5" />, path: '/delivery/trips'      },
    { id: 'active',      label: t.activeTrip      || 'Active Trip',        icon: <ShoppingBag     className="w-5 h-5" />, path: '/delivery/active-trip' },
    { id: 'hub-intake',  label: t.hubIntake       || 'Hub Intake',         icon: <MapPin          className="w-5 h-5" />, path: '/delivery/hub-intake' },
    { id: 'vehicles',    label: t.vehicles        || 'My Vehicles',        icon: <Sprout          className="w-5 h-5" />, path: '/delivery/vehicles'   },
    { id: 'earnings',    label: t.earningsWallet  || 'Earnings & Wallet',  icon: <Wallet         className="w-5 h-5" />, path: '/delivery/earnings'   },
  ];
}

export function getAdminNavItems(t: Record<string, string>): NavItemDef[] {
  return [
    { id: 'dashboard',  label: 'Dashboard',           icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard'   },
    { id: 'kyc',        label: 'KYC Approvals',       icon: <Package         className="w-5 h-5" />, path: '/admin/kyc-queue'   },
    { id: 'orders',     label: 'Order Management',    icon: <ShoppingBag     className="w-5 h-5" />, path: '/admin/orders'      },
    { id: 'logistics',  label: 'Logistics',           icon: <MapPin          className="w-5 h-5" />, path: '/admin/logistics'   },
    { id: 'payouts',    label: 'Payout Queue',        icon: <Wallet          className="w-5 h-5" />, path: '/admin/payouts'     },
    { id: 'disputes',   label: 'Disputes',            icon: <Sprout          className="w-5 h-5" />, path: '/admin/disputes'    },
    { id: 'reports',    label: 'Reports & Audit',     icon: <Package         className="w-5 h-5" />, path: '/admin/reports'     },
  ];
}
