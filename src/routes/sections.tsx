import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { ProtectedRoute } from 'src/routes/components/protected-route';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const PropertiesPage = lazy(() => import('src/pages/properties'));
export const TenantsPage = lazy(() => import('src/pages/tenants'));
export const UnitsPage = lazy(() => import('src/pages/units'));
export const LeasesPage = lazy(() => import('src/pages/leases'));
export const InvoicesPage = lazy(() => import('src/pages/invoices'));
export const PaymentsPage = lazy(() => import('src/pages/payments'));
export const WorkOrdersPage = lazy(() => import('src/pages/work-orders'));
export const ReportsPage = lazy(() => import('src/pages/reports'));
export const UtilitiesPage = lazy(() => import('src/pages/utilities'));
export const OrganizationsPage = lazy(() => import('src/pages/organizations'));
export const SubscriptionPlansPage = lazy(() => import('src/pages/subscription-plans'));
export const ActiveSubscriptionsPage = lazy(() => import('src/pages/active-subscriptions'));
export const PlatformAnalyticsPage = lazy(() => import('src/pages/platform-analytics'));
export const SystemSettingsPage = lazy(() => import('src/pages/platform-admin/system-settings'));
export const UserManagementPage = lazy(() => import('src/pages/platform-admin/user-management'));
export const PropertyManagementPage = lazy(() => import('src/pages/platform-admin/property-management'));
export const UnitManagementPage = lazy(() => import('src/pages/platform-admin/unit-management'));
export const TenantManagementPage = lazy(() => import('src/pages/platform-admin/tenant-management'));
export const AuditLogsPage = lazy(() => import('src/pages/platform-admin/audit-logs'));
export const OrganizationDashboardPage = lazy(() => import('src/pages/property-owner/organization-dashboard'));
export const OrganizationSettingsPage = lazy(() => import('src/pages/property-owner/organization-settings'));
export const BillingSubscriptionPage = lazy(() => import('src/pages/property-owner/billing-subscription'));
export const StaffManagementPage = lazy(() => import('src/pages/property-owner/staff-management'));
export const RoleDebugPage = lazy(() => import('src/pages/role-debug'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'tenants', element: <TenantsPage /> },
      { path: 'units', element: <UnitsPage /> },
      { path: 'leases', element: <LeasesPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'work-orders', element: <WorkOrdersPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'utilities', element: <UtilitiesPage /> },
      { path: 'organizations', element: <OrganizationsPage /> },
      { path: 'subscription-plans', element: <SubscriptionPlansPage /> },
      { path: 'active-subscriptions', element: <ActiveSubscriptionsPage /> },
      { path: 'platform-analytics', element: <PlatformAnalyticsPage /> },
      { path: 'system-settings', element: <SystemSettingsPage /> },
      { path: 'user-management', element: <UserManagementPage /> },
      { path: 'property-management', element: <PropertyManagementPage /> },
      { path: 'unit-management', element: <UnitManagementPage /> },
      { path: 'tenant-management', element: <TenantManagementPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'organization-dashboard', element: <OrganizationDashboardPage /> },
      { path: 'organization-settings', element: <OrganizationSettingsPage /> },
      { path: 'billing-subscription', element: <BillingSubscriptionPage /> },
      { path: 'staff-management', element: <StaffManagementPage /> },
      { path: 'role-debug', element: <RoleDebugPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <AuthLayout>
        <SignUpPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
