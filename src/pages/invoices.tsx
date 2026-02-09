import Container from '@mui/material/Container';

import { InvoicesView } from 'src/sections/invoices/invoices-view';

// -----------------------------------------------------------------------

export default function InvoicesPage() {
  return (
    <Container maxWidth="xl">
      <InvoicesView />
    </Container>
  );
}
