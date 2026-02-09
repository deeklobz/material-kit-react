import { CONFIG } from 'src/config-global';

import { OrganizationsView } from 'src/sections/platform-admin/organizations-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Organizations - ${CONFIG.appName}`}</title>

      <OrganizationsView />
    </>
  );
}
