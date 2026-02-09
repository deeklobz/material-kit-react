import Container from '@mui/material/Container';

import { LeasesView } from 'src/sections/leases/leases-view';

// -----------------------------------------------------------------------

export default function LeasesPage() {
  return (
    <Container maxWidth="xl">
      <LeasesView />
    </Container>
  );
}
