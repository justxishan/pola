import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Role, ADMIN_ROLES, DELIVERY_ROLES, FARMER_ROLES, CUSTOMER_ROLES } from '@pola/shared';
import { RootLayout } from './RootLayout';
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
import { OrderManagementPage } from './pages/admin/OrderManagementPage';
import { DisputeAdjudicationPage } from './pages/admin/DisputeAdjudicationPage';
import { LogisticsPage } from './pages/admin/LogisticsPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { ReportsPage } from './pages/admin/ReportsPage';

// Shared Pages
import { WalletPage } from './pages/shared/WalletPage';
import { EditProfilePage } from './pages/shared/EditProfilePage';
import { HelpSupportPage } from './pages/shared/HelpSupportPage';
import { MessagesPage } from './pages/shared/MessagesPage';
import { NotFoundPage } from './pages/shared/NotFoundPage';

export const router = createBrowserRouter([
  {
    // RootLayout is the single parent for the entire app.
    // It lives INSIDE the router context, so useNavigate() is safe inside it.
    // This is where the CartDrawer, Toaster, theme sync, and cart hydration live.
    element: <RootLayout />,
    children: [
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
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <FarmerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/farms',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <MyFarmsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/farms/new',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <AddFarmPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/products',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <MyProductsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/products/new',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <AddProductPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/products/:id/edit',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <EditProductPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/orders',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <FarmerOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/hubs',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <HubDropoffPage />
          </ProtectedRoute>
        ),
      },

      // 2. Customer & Buyer Marketplace Routes
      { path: '/', element: <HomePage /> },
      { path: '/customer/login', element: <CustomerLoginPage /> },
      { path: '/login', element: <Navigate to="/customer/login" replace /> },
      // /auth/login is used by the 401 interceptor — map to customer login.
      // Portal-specific 401s are handled by the interceptor reading the current path.
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
        // Checkout is public so guests can browse — auth guard lives inside the page
        // (it redirects to /customer/login?redirect=/checkout on submit)
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        // /orders/:id — canonical order confirmation/summary view after placing an order
        path: '/orders/:id',
        element: (
          <ProtectedRoute redirectPath="/customer/login">
            <OrderTrackingPage />
          </ProtectedRoute>
        ),
      },
      {
        // /orders/:id/track — alias used in some places; redirect to canonical route
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
          <ProtectedRoute allowedRoles={DELIVERY_ROLES} redirectPath="/delivery/login">
            <DeliveryDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/delivery/available',
        element: (
          <ProtectedRoute allowedRoles={DELIVERY_ROLES} redirectPath="/delivery/login">
            <AvailableTripsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/delivery/hub-schedule',
        element: (
          <ProtectedRoute allowedRoles={DELIVERY_ROLES} redirectPath="/delivery/login">
            <HubIntakePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/delivery/active-trip',
        element: (
          <ProtectedRoute allowedRoles={DELIVERY_ROLES} redirectPath="/delivery/login">
            <ActiveTripPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/delivery/vehicles',
        element: (
          <ProtectedRoute allowedRoles={DELIVERY_ROLES} redirectPath="/delivery/login">
            <VehiclesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/delivery/earnings',
        element: (
          <ProtectedRoute allowedRoles={DELIVERY_ROLES} redirectPath="/delivery/login">
            <EarningsPage />
          </ProtectedRoute>
        ),
      },

      // 4. Executive Admin Routes
      { path: '/admin/login', element: <AdminLoginPage /> },
      {
        path: '/admin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES} redirectPath="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/kyc',
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES} redirectPath="/admin/login">
            <KycQueuePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/payouts',
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN_SUPER, Role.ADMIN_FINANCE]} redirectPath="/admin/login">
            <PayoutQueuePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/orders',
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES} redirectPath="/admin/login">
            <OrderManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/disputes',
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN_SUPER, Role.ADMIN_LOGISTICS, Role.ADMIN_SUPPORT]} redirectPath="/admin/login">
            <DisputeAdjudicationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/hubs',
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN_SUPER, Role.ADMIN_LOGISTICS]} redirectPath="/admin/login">
            <LogisticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/audit',
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN_SUPER, Role.ADMIN_LOGISTICS, Role.ADMIN_FINANCE]} redirectPath="/admin/login">
            <AuditLogPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/reports',
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN_SUPER, Role.ADMIN_LOGISTICS, Role.ADMIN_FINANCE]} redirectPath="/admin/login">
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
      {
        path: '/profile/edit',
        element: (
          <ProtectedRoute redirectPath="/customer/login">
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute redirectPath="/customer/login">
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/profile/edit',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/support',
        element: (
          <ProtectedRoute redirectPath="/customer/login">
            <HelpSupportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/support',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <HelpSupportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/messages',
        element: (
          <ProtectedRoute redirectPath="/customer/login">
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/farmer/messages',
        element: (
          <ProtectedRoute allowedRoles={FARMER_ROLES} redirectPath="/farmer/login">
            <MessagesPage />
          </ProtectedRoute>
        ),
      },

      // 404 Catch-All
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
