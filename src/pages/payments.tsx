import Container from '@mui/material/Container';

import { PaymentsView } from 'src/sections/payments/payments-view';

// -----------------------------------------------------------------------

export default function PaymentsPage() {
  return (
    <Container maxWidth="xl">
      <PaymentsView />
    </Container>
  );
}
