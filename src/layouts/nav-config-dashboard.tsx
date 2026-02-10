import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: string[]; // Roles that can see this item
};

// Platform Admin Navigation
export const platformAdminNav: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
    roles: ['platform_admin'],
  },
  {
    title: 'Organizations',
    path: '/organizations',
    icon: icon('ic-cart'),
    roles: ['platform_admin'],
  },
  {
    title: 'Subscription Plans',
    path: '/subscription-plans',
    icon: icon('ic-blog'),
    roles: ['platform_admin'],
  },
  {
    title: 'Active Subscriptions',
    path: '/active-subscriptions',
    icon: icon('ic-blog'),
    roles: ['platform_admin'],
  },
  {
    title: 'Platform Analytics',
    path: '/platform-analytics',
    icon: icon('ic-analytics'),
    roles: ['platform_admin'],
  },
  {
    title: 'User Management',
    path: '/user-management',
    icon: icon('ic-user'),
    roles: ['platform_admin'],
  },
  {
    title: 'Properties',
    path: '/property-management',
    icon: icon('ic-cart'),
    roles: ['platform_admin'],
  },
  {
    title: 'Units',
    path: '/unit-management',
    icon: icon('ic-blog'),
    roles: ['platform_admin'],
  },
  {
    title: 'Tenants',
    path: '/tenant-management',
    icon: icon('ic-user'),
    roles: ['platform_admin'],
  },
  {
    title: 'Audit Logs',
    path: '/audit-logs',
    icon: icon('ic-blog'),
    roles: ['platform_admin'],
  },
  {
    title: 'System Settings',
    path: '/system-settings',
    icon: icon('ic-disabled'),
    roles: ['platform_admin'],
  },
];

// Property Manager Navigation (includes Property Owner pages for org_admin)
export const propertyManagerNav: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
    roles: ['org_admin', 'manager'],
  },
  {
    title: 'Organization Settings',
    path: '/organization-settings',
    icon: icon('ic-disabled'),
    roles: ['org_admin'],
  },
  {
    title: 'Staff Management',
    path: '/staff-management',
    icon: icon('ic-user'),
    roles: ['org_admin'],
  },
  {
    title: 'Billing & Subscription',
    path: '/billing-subscription',
    icon: icon('ic-analytics'),
    roles: ['org_admin'],
  },
  {
    title: 'Properties',
    path: '/properties',
    icon: icon('ic-cart'),
    roles: ['org_admin', 'manager'],
  },
  {
    title: 'Units',
    path: '/units',
    icon: icon('ic-disabled'),
    roles: ['org_admin', 'manager'],
  },
  {
    title: 'Tenants',
    path: '/tenants',
    icon: icon('ic-user'),
    roles: ['org_admin', 'manager', 'agent'],
  },
  {
    title: 'Leases',
    path: '/leases',
    icon: icon('ic-blog'),
    roles: ['org_admin', 'manager', 'agent'],
  },
  {
    title: 'Invoices',
    path: '/invoices',
    icon: icon('ic-blog'),
    roles: ['org_admin', 'manager'],
  },
  {
    title: 'Payments',
    path: '/payments',
    icon: icon('ic-analytics'),
    roles: ['org_admin', 'manager'],
  },
  {
    title: 'Maintenance',
    path: '/work-orders',
    icon: icon('ic-disabled'),
    roles: ['org_admin', 'manager', 'caretaker'],
  },
  {
    title: 'Utilities',
    path: '/utilities',
    icon: icon('ic-analytics'),
    roles: ['org_admin', 'manager', 'caretaker'],
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: icon('ic-analytics'),
    roles: ['org_admin', 'manager'],
  },
];

// Get nav items based on user role
export function getNavItems(userRole: string | undefined): NavItem[] {
  if (!userRole) return propertyManagerNav;
  
  if (userRole === 'platform_admin') {
    return platformAdminNav;
  }
  
  return propertyManagerNav;
}

// Legacy export for backwards compatibility
export const navData = propertyManagerNav;
