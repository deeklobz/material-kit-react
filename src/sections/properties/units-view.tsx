import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// -----------------------------------------------------------------------

export function UnitsView() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h3">Units</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Units page - Coming soon
        </Typography>
      </Box>
    </Container>
  );
}
