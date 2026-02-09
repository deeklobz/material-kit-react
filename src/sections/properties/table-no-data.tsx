import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function TableNoData() {
  return (
    <TableRow>
      <TableCell align="center" colSpan={9} sx={{ py: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          No properties found
        </Typography>
        <Typography variant="body2">
          Get started by adding your first property
        </Typography>
      </TableCell>
    </TableRow>
  );
}
