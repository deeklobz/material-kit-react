import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { paymentService, type Payment, type PaymentFormData } from 'src/services/paymentService';
import { invoiceService } from 'src/services/invoiceService';
import { tenantService, type Tenant } from 'src/services/tenantService';

// ----------------------------------------------------------------------

export function PaymentsView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openReverse, setOpenReverse] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const [formData, setFormData] = useState({
    tenant_id: '',
    invoice_id: '',
    receipt_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'mpesa' as const,
    reference_number: '',
    notes: '',
    status: 'completed' as const,
  });

  const { data: paymentsData, isLoading, error } = useQuery({
    queryKey: ['payments', page],
    queryFn: () => paymentService.getAll({ page: page + 1 }),
  });

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantService.getAll,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['unpaid-invoices'],
    queryFn: () => invoiceService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: paymentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => paymentService.reverse(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const payments = paymentsData?.data || paymentsData || [];
  const totalPayments = paymentsData?.total || payments.length;
  const rowsPerPage = paymentsData?.per_page || payments.length || 20;

  const tenants = useMemo(() => {
    return Array.isArray(tenantsData) ? tenantsData : (tenantsData as any)?.data || [];
  }, [tenantsData]);

  const invoices = invoicesData?.data || invoicesData || [];
  const unpaidInvoices = useMemo(() => {
    return invoices.filter((invoice: any) => !['paid', 'cancelled'].includes(invoice.status));
  }, [invoices]);

  const tenantUnitMap = useMemo(() => {
    const map = new Map<string, string>();
    unpaidInvoices.forEach((invoice: any) => {
      if (!invoice?.tenant_id) return;
      const unitName = invoice?.lease?.unit?.unit_number || invoice?.lease?.unit?.name;
      if (unitName && !map.has(invoice.tenant_id)) {
        map.set(invoice.tenant_id, unitName);
      }
    });
    return map;
  }, [unpaidInvoices]);

  const selectedTenant = useMemo(() => {
    return tenants.find((t: Tenant) => t.id === formData.tenant_id) || null;
  }, [tenants, formData.tenant_id]);

  const tenantOptions = useMemo(() => {
    return tenants.map((tenant: Tenant) => {
      const unitName = tenantUnitMap.get(tenant.id);
      const label = unitName
        ? `${tenant.first_name} ${tenant.last_name} - ${unitName}`
        : `${tenant.first_name} ${tenant.last_name}`;
      return { ...tenant, label };
    });
  }, [tenants, tenantUnitMap]);

  const filteredInvoices = useMemo(() => {
    if (!formData.tenant_id) return [];
    return unpaidInvoices.filter((invoice: any) => invoice.tenant_id === formData.tenant_id);
  }, [unpaidInvoices, formData.tenant_id]);

  const handleCreate = useCallback(async () => {
    try {
      if (!formData.tenant_id || !formData.receipt_number) {
        alert('Tenant and receipt number are required.');
        return;
      }
      if (!formData.invoice_id) {
        alert('Invoice is required for payment processing.');
        return;
      }
      if (!formData.amount || Number(formData.amount) <= 0) {
        alert('Valid payment amount is required.');
        return;
      }

      await createMutation.mutateAsync({
        tenant_id: formData.tenant_id,
        invoice_id: formData.invoice_id,
        receipt_number: formData.receipt_number,
        payment_date: formData.payment_date,
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      });

      setOpenCreate(false);
      setFormData({
        tenant_id: '',
        invoice_id: '',
        receipt_number: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'mpesa',
        reference_number: '',
        notes: '',
        status: 'completed',
      });
    } catch (err: any) {
      console.error('Failed to record payment', err?.response?.data || err);
      const message = err?.response?.data?.message || err?.message || 'Failed to record payment.';
      alert(message);
    }
  }, [createMutation, formData]);

  const handleReverse = useCallback(async () => {
    if (!selectedPayment) return;
    try {
      await reverseMutation.mutateAsync({ id: selectedPayment.id, reason: reverseReason });
      setOpenReverse(false);
      setReverseReason('');
      setSelectedPayment(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to reverse payment.';
      alert(message);
    }
  }, [selectedPayment, reverseReason, reverseMutation]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, payment: Payment) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewPayment = () => {
    setOpenView(true);
    handleMenuClose();
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    setFormData({ ...formData, receipt_number: `RCT-${timestamp}` });
  };

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Payments</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpenCreate(true)}>
          Record Payment
        </Button>
      </Box>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">
              Failed to load payments: {error instanceof Error ? error.message : 'Unknown error'}
            </Typography>
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Receipt #</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>{payment.receipt_number}</TableCell>
                        <TableCell>
                          {payment.tenant ? `${payment.tenant.first_name} ${payment.tenant.last_name}` : '-'}
                        </TableCell>
                        <TableCell>{payment.payment_date}</TableCell>
                        <TableCell>KES {Number(payment.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={payment.payment_method} size="small" />
                        </TableCell>
                        <TableCell>{payment.reference_number || '-'}</TableCell>
                        <TableCell>
                          <Label
                            color={
                              (payment.status === 'completed' && 'success') ||
                              (payment.status === 'failed' && 'error') ||
                              (payment.status === 'reversed' && 'warning') ||
                              'default'
                            }
                          >
                            {payment.status}
                          </Label>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleMenuOpen(e, payment)}>
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={totalPayments}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </>
        )}
      </Card>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 160,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
            },
          }}
        >
          <MenuItem onClick={handleViewPayment}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
          {selectedPayment?.status === 'completed' && (
            <MenuItem
              onClick={() => {
                setOpenReverse(true);
                handleMenuClose();
              }}
            >
              <Iconify icon="solar:restart-bold" />
              Reverse
            </MenuItem>
          )}
        </MenuList>
      </Popover>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Receipt Number"
              value={formData.receipt_number}
              onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <Button size="small" onClick={generateReceiptNumber}>
                    Generate
                  </Button>
                ),
              }}
            />

            <Autocomplete
              options={tenantOptions as any}
              value={selectedTenant as any}
              onChange={(_, value: any) => {
                setFormData({
                  ...formData,
                  tenant_id: value?.id || '',
                  invoice_id: '',
                });
              }}
              getOptionLabel={(option: any) => option.label || ''}
              renderOption={(props, option: any) => (
                <li {...props} key={option.id}>
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tenant"
                  placeholder="Search tenant"
                  required
                />
              )}
              isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
            />

            <TextField
              select
              label="Invoice"
              value={formData.invoice_id}
              onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
              fullWidth
              required
            >
              {filteredInvoices.map((invoice: any) => (
                <MenuItem key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - KES {invoice.total_amount}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Payment Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
            />

            <TextField
              select
              label="Payment Method"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
              fullWidth
              required
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="mpesa">M-Pesa</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              label="Reference Number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              fullWidth
              placeholder="Transaction ID / Cheque No."
            />

            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payment Details - {selectedPayment?.receipt_number}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2">Tenant</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPayment?.tenant?.first_name} {selectedPayment?.tenant?.last_name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Payment Date</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPayment?.payment_date}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Amount</Typography>
              <Typography variant="body2" color="text.secondary">
                KES {selectedPayment?.amount.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Method</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPayment?.payment_method}
              </Typography>
            </Box>
            {selectedPayment?.reference_number && (
              <Box>
                <Typography variant="subtitle2">Reference</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPayment.reference_number}
                </Typography>
              </Box>
            )}
            {selectedPayment?.invoice && (
              <Box>
                <Typography variant="subtitle2">Invoice</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPayment.invoice.invoice_number}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReverse} onClose={() => setOpenReverse(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reverse Payment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to reverse this payment? This action will update the invoice balance.
            </Typography>
            <TextField
              label="Reason for Reversal"
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReverse(false)}>Cancel</Button>
          <Button onClick={handleReverse} variant="contained" color="error">
            Reverse Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
