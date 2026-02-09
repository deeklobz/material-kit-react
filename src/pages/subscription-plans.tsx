import { CONFIG } from 'src/config-global';

import { SubscriptionPlansView } from 'src/sections/platform-admin/subscription-plans-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Subscription Plans - ${CONFIG.appName}`}</title>

      <SubscriptionPlansView />
    </>
  );
}
