import { CONFIG } from 'src/config-global';

import { PlatformAnalyticsView } from 'src/sections/platform-admin/platform-analytics-view';

// ----------------------------------------------------------------------

export default function PlatformAnalyticsPage() {
  const title = `Platform Analytics - ${CONFIG.appName}`;

  if (typeof document !== 'undefined') {
    document.title = title;
  }

  return (
    <PlatformAnalyticsView />
  );
}
