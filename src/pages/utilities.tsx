import Container from '@mui/material/Container';

import { UtilitiesView } from 'src/sections/utilities';

// -----------------------------------------------------------------------

export default function UtilitiesPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <UtilitiesView />
    </Container>
  );
}
