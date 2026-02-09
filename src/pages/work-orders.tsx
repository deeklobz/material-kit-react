import { CONFIG } from 'src/config-global';

import { WorkOrdersView } from 'src/sections/work-orders';

// -----------------------------------------------------------------------

export default function WorkOrdersPage() {
  return (
    <>
      <title>{`Work Orders - ${CONFIG.appName}`}</title>

      <WorkOrdersView />
    </>
  );
}
