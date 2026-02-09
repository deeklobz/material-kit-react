import { useState } from 'react';

import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import { TaxDashboardView, ReportsView } from 'src/sections/reports';

// -----------------------------------------------------------------------

export default function ReportsPage() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Reports & Analytics" />
        <Tab label="Tax Dashboard" />
      </Tabs>

      <Box>
        {currentTab === 0 && <ReportsView />}
        {currentTab === 1 && <TaxDashboardView />}
      </Box>
    </Container>
  );
}
