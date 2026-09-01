import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/templates/ProtectedRoute';

// Dedicated Auth & Portal Selection Pages
import { PortalSelectPage } from './pages/auth/PortalSelectPage';
import { FarmerLoginPage } from './pages/auth/FarmerLoginPage';
import { CustomerLoginPage } from './pages/auth/CustomerLoginPage';
import { DeliveryLoginPage } from './pages/auth/DeliveryLoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { RoleSelectPage } from './pages/auth/RoleSelectPage';
import { KycUploadPage } from './pages/auth/KycUploadPage';

// Onboarding Wizards
import { FarmerOnboardingPage } from './pages/farmer/FarmerOnboardingPage';
import { CustomerOnboardingPage } from './pages/marketplace/CustomerOnboardingPage';
import { DeliveryOnboardingPage } from './pages/delivery/DeliveryOnboardingPage';

// Marketplace Pages
import { HomePage } from './pages/marketplace/HomePage';
import { CatalogPage } from './pages/marketplace/CatalogPage';
import { ProductDetailPage } from './pages/marketplace/ProductDetailPage';
import { CheckoutPage } from './pages/marketplace/CheckoutPage';
import { OrderTrackingPage } from './pages/marketplace/OrderTrackingPage';
import { CustomerOrdersPage } from './pages/marketplace/CustomerOrdersPage';

// Farmer Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { MyFarmsPage } from './pages/farmer/MyFarmsPage';
import { AddFarmPage } from './pages/farmer/AddFarmPage';
import { MyProductsPage } from './pages/farmer/MyProductsPage';
import { AddProductPage } from './pages/farmer/AddProductPage';
import { EditProductPage } from './pages/farmer/EditProductPage';
import { FarmerOrdersPage } from './pages/farmer/FarmerOrdersPage';
import { HubDropoffPage } from './pages/farmer/HubDropoffPage';

// Delivery Pages
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';
import { AvailableTripsPage } from './pages/delivery/AvailableTripsPage';
import { HubIntakePage } from './pages/delivery/HubIntakePage';
import { ActiveTripPage } from './pages/delivery/ActiveTripPage';
import { VehiclesPage } from './pages/delivery/VehiclesPage';
import { EarningsPage } from './pages/delivery/EarningsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { KycQueuePage } from './pages/admin/KycQueuePage';
import { PayoutQueuePage } from './pages/admin/PayoutQueuePage';
import { DisputeAdjudicationPage } from './pages/admin/DisputeAdjudicationPage';
import { LogisticsPage } from './pages/admin/LogisticsPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { ReportsPage } from './pages/admin/ReportsPage';

// Shared Pages
import { WalletPage } from './pages/shared/WalletPage';
import { NotFoundPage } from './pages/shared/NotFoundPage';

export const router = createBrowserRouter([
  // Universal Multi-Portal Hub
  { path: '/portals', element: <PortalSelectPage /> },
  { path: '/portal-select', element: <PortalSelectPage /> },

  // 1. Farmer Portal Routes
  { path: '/farmer/login', element: <FarmerLoginPage /> },
  {
    path: '/farmer/onboarding',
    element: (
      <ProtectedRoute redirectPath="/farmer/login">
        <FarmerOnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/farmer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['farmer', 'collector']} redirectPath="/farmer/login">
        <FarmerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/farmer/farms',
    element: (
      <ProtectedRoute allowedRoles={['farmer', 'collector']} redirectPath="/farmer/login">
        <MyFarmsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/farmer/farms/new',
    element: (
      <ProtectedRoute allowedRoles={['farmer', 'collector']} redirectPath="/farmer/login">
        <AddFarmPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/farmer/products',
    element: (
      <ProtectedRoute allowedRoles={['farmer', 'collector']} redirectPath="/farmer/login">
        <MyProductsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/farmer/products/new',
    element: (
      <ProtectedRoute allowedRoles={['farmer', 'collector']} redirectPath="/farmer/login">
        <AddProductPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/farmer/products/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={['farmer', 'collector']} redirectPath="/farmer/login">
        <EditProductPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/farmer/orders',
    element: (
      <ProtectedRoute allowedRoles={['farmer', 'collector']} redirectPath="/farmer/login">
        <FarmerOrdersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/farmer/hubs',
    element: (
      <ProtectedRoute allowedRoles={['farmer', 'collector']} redirectPath="/farmer/login">
        <HubDropoffPage />
      </ProtectedRoute>
    ),
  },

  // 2. Customer & Buyer Marketplace Routes
  { path: '/', element: <HomePage /> },
  { path: '/customer/login', element: <CustomerLoginPage /> },
  { path: '/login', element: <Navigate to="/customer/login" replace /> },
  { path: '/auth/login', element: <Navigate to="/customer/login" replace /> },
  { path: '/catalog', element: <CatalogPage /> },
  { path: '/product/:id', element: <ProductDetailPage /> },
  {
    path: '/customer/onboarding',
    element: (
      <ProtectedRoute redirectPath="/customer/login">
        <CustomerOnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    path: '/orders/:id',
    element: (
      <ProtectedRoute redirectPath="/customer/login">
        <OrderTrackingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders/:id/track',
    element: (
      <ProtectedRoute redirectPath="/customer/login">
        <OrderTrackingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/orders',
    element: (
      <ProtectedRoute redirectPath="/customer/login">
        <CustomerOrdersPage />
      </ProtectedRoute>
    ),
  },

  // 3. Delivery Fleet & Courier Routes
  { path: '/delivery/login', element: <DeliveryLoginPage /> },
  {
    path: '/delivery/onboarding',
    element: (
      <ProtectedRoute redirectPath="/delivery/login">
        <DeliveryOnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/delivery/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['delivery_individual', 'delivery_company']} redirectPath="/delivery/login">
        <DeliveryDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/delivery/available',
    element: (
      <ProtectedRoute allowedRoles={['delivery_individual', 'delivery_company']} redirectPath="/delivery/login">
        <AvailableTripsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/delivery/hub-schedule',
    element: (
      <ProtectedRoute allowedRoles={['delivery_individual', 'delivery_company']} redirectPath="/delivery/login">
        <HubIntakePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/delivery/active-trip',
    element: (
      <ProtectedRoute allowedRoles={['delivery_individual', 'delivery_company']} redirectPath="/delivery/login">
        <ActiveTripPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/delivery/vehicles',
    element: (
      <ProtectedRoute allowedRoles={['delivery_individual', 'delivery_company']} redirectPath="/delivery/login">
        <VehiclesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/delivery/earnings',
    element: (
      <ProtectedRoute allowedRoles={['delivery_individual', 'delivery_company']} redirectPath="/delivery/login">
        <EarningsPage />
      </ProtectedRoute>
    ),
  },

  // 4. Executive Admin Routes
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin_super', 'admin_ops', 'admin_finance', 'admin_support']} redirectPath="/admin/login">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/kyc',
    element: (
      <ProtectedRoute allowedRoles={['admin_super', 'admin_ops', 'admin_finance', 'admin_support']} redirectPath="/admin/login">
        <KycQueuePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/payouts',
    element: (
      <ProtectedRoute allowedRoles={['admin_super', 'admin_finance']} redirectPath="/admin/login">
        <PayoutQueuePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/disputes',
    element: (
      <ProtectedRoute allowedRoles={['admin_super', 'admin_ops', 'admin_support']} redirectPath="/admin/login">
        <DisputeAdjudicationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/hubs',
    element: (
      <ProtectedRoute allowedRoles={['admin_super', 'admin_ops']} redirectPath="/admin/login">
        <LogisticsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/audit',
    element: (
      <ProtectedRoute allowedRoles={['admin_super', 'admin_ops', 'admin_finance']} redirectPath="/admin/login">
        <AuditLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/reports',
    element: (
      <ProtectedRoute allowedRoles={['admin_super', 'admin_ops', 'admin_finance']} redirectPath="/admin/login">
        <ReportsPage />
      </ProtectedRoute>
    ),
  },

  // Shared Auth & Verification
  { path: '/auth/verify', element: <VerifyOtpPage /> },
  { path: '/auth/select-role', element: <RoleSelectPage /> },
  {
    path: '/auth/kyc',
    element: (
      <ProtectedRoute redirectPath="/customer/login">
        <KycUploadPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wallet',
    element: (
      <ProtectedRoute redirectPath="/customer/login">
        <WalletPage />
      </ProtectedRoute>
    ),
  },

  // 404 Catch-All
  { path: '*', element: <NotFoundPage /> },
]);
