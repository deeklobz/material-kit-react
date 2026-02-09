import { CONFIG } from 'src/config-global';

import { PropertiesView } from 'src/sections/properties';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Properties - ${CONFIG.appName}`}</title>

      <PropertiesView />
    </>
  );
}
