import { CONFIG } from 'src/config-global';

import { TenantsView } from 'src/sections/tenants';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Tenants - ${CONFIG.appName}`}</title>

      <TenantsView />
    </>
  );
}
