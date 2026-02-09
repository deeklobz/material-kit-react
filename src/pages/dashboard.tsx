import { CONFIG } from 'src/config-global';
import { useAuth } from 'src/context/AuthContext';

import { PlatformDashboardView } from 'src/sections/platform-admin';
import { PropertyManagerDashboardView } from 'src/sections/property-manager';

// ----------------------------------------------------------------------

export default function Page() {
  const { user } = useAuth();

  const renderDashboard = () => {
    if (user?.role === 'platform_admin') {
      return <PlatformDashboardView />;
    }
    
    if (user?.role === 'org_admin' || user?.role === 'manager') {
      return <PropertyManagerDashboardView />;
    }

    // Default fallback
    return <PropertyManagerDashboardView />;
  };

  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style"
      />
      <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />

      {renderDashboard()}
    </>
  );
}
