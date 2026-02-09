import { CONFIG } from 'src/config-global';

import { ActiveSubscriptionsView } from 'src/sections/platform-admin/active-subscriptions-view';

// ----------------------------------------------------------------------

export default function ActiveSubscriptionsPage() {
  const title = `Active Subscriptions - ${CONFIG.appName}`;

  if (typeof document !== 'undefined') {
    document.title = title;
  }

  return (
    <ActiveSubscriptionsView />
  );
}
