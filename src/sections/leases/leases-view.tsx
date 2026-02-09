import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { leaseService, type Lease, type LeaseFormData } from 'src/services/leaseService';
import { tenantService, type Tenant } from 'src/services/tenantService';
import { unitService } from 'src/services/unitService';

// ----------------------------------------------------------------------

export function LeasesView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openTerminate, setOpenTerminate] = useState(false);
  const [openLeaseView, setOpenLeaseView] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [editableTerms, setEditableTerms] = useState('');

  const [formData, setFormData] = useState({
    unit_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_amount: '',
    deposit_amount: '',
    payment_day: '5',
    lease_terms: '',
    status: 'active',
  });

  const [terminateForm, setTerminateForm] = useState({
    termination_date: '',
    termination_reason: '',
  });

  const { data: leasesData, isLoading, error } = useQuery({
    queryKey: ['leases', page],
    queryFn: () => leaseService.getAll({ page: page + 1 }),
  });

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantService.getAll,
  });

  const { data: unitsData } = useQuery({
    queryKey: ['vacant-units'],
    queryFn: () => unitService.getAll({ status: 'vacant' }),
  });

  const createMutation = useMutation({
    mutationFn: leaseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
    },
  });

  const terminateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { termination_date: string; termination_reason?: string } }) =>
      leaseService.terminate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
    },
  });

  const leases = leasesData?.data || leasesData || [];
  const totalLeases = leasesData?.total || leases.length;
  const rowsPerPage = leasesData?.per_page || leases.length || 20;

  const tenants = useMemo(() => {
    return Array.isArray(tenantsData) ? tenantsData : (tenantsData as any)?.data || [];
  }, [tenantsData]);

  const units = unitsData || [];

  const handleCreate = useCallback(async () => {
    try {
      if (!formData.unit_id || !formData.tenant_id) {
        alert('Tenant and unit are required.');
        return;
      }
      if (!formData.start_date || !formData.end_date) {
        alert('Lease dates are required.');
        return;
      }
      if (!formData.rent_amount || !formData.deposit_amount) {
        alert('Rent and deposit amounts are required.');
        return;
      }

      await createMutation.mutateAsync({
        unit_id: formData.unit_id,
        tenant_id: formData.tenant_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        rent_amount: Number(formData.rent_amount),
        deposit_amount: Number(formData.deposit_amount),
        payment_day: Number(formData.payment_day),
        lease_terms: formData.lease_terms || undefined,
        status: formData.status as LeaseFormData['status'],
      });

      setOpenCreate(false);
      setFormData({
        unit_id: '',
        tenant_id: '',
        start_date: '',
        end_date: '',
        rent_amount: '',
        deposit_amount: '',
        payment_day: '5',
        lease_terms: '',
        status: 'active',
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create lease.';
      alert(message);
    }
  }, [createMutation, formData]);

  const handleTerminate = useCallback(async () => {
    if (!selectedLease) return;
    try {
      await terminateMutation.mutateAsync({
        id: selectedLease.id,
        payload: {
          termination_date: terminateForm.termination_date,
          termination_reason: terminateForm.termination_reason || undefined,
        },
      });
      setOpenTerminate(false);
      setSelectedLease(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to terminate lease.';
      alert(message);
    }
  }, [selectedLease, terminateForm, terminateMutation]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, lease: Lease) => {
    setAnchorEl(event.currentTarget);
    setSelectedLease(lease);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewLease = () => {
    if (selectedLease) {
      setEditableTerms(selectedLease.terms || '');
      setOpenLeaseView(true);
      handleMenuClose();
    }
  };

  const handleDownloadLease = () => {
    if (!selectedLease) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const leaseDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lease Agreement - ${selectedLease.lease_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
            .field { margin-bottom: 8px; }
            .field-label { font-weight: bold; display: inline-block; width: 180px; }
            .terms { white-space: pre-wrap; border: 1px solid #ddd; padding: 15px; background: #f9f9f9; margin-top: 10px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LEASE AGREEMENT</h1>
            <p><strong>Lease Number:</strong> ${selectedLease.lease_number}</p>
          </div>

          <div class="section">
            <div class="section-title">Organization Details</div>
            <div class="field"><span class="field-label">Organization:</span> ${selectedLease.unit?.property?.organization?.name || 'N/A'}</div>
            <div class="field"><span class="field-label">Address:</span> ${selectedLease.unit?.property?.address || 'N/A'}</div>
            <div class="field"><span class="field-label">Contact:</span> ${selectedLease.unit?.property?.organization?.email || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Tenant Details</div>
            <div class="field"><span class="field-label">Name:</span> ${selectedLease.tenant?.first_name} ${selectedLease.tenant?.last_name}</div>
            <div class="field"><span class="field-label">Email:</span> ${selectedLease.tenant?.email}</div>
            <div class="field"><span class="field-label">Phone:</span> ${selectedLease.tenant?.phone || 'N/A'}</div>
            <div class="field"><span class="field-label">ID Number:</span> ${selectedLease.tenant?.id_number || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Property Details</div>
            <div class="field"><span class="field-label">Property:</span> ${selectedLease.unit?.property?.name || 'N/A'}</div>
            <div class="field"><span class="field-label">Unit Number:</span> ${selectedLease.unit?.unit_number}</div>
            <div class="field"><span class="field-label">Unit Type:</span> ${selectedLease.unit?.bedrooms ? selectedLease.unit.bedrooms + ' Bedroom' : 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Lease Terms</div>
            <div class="field"><span class="field-label">Start Date:</span> ${selectedLease.start_date}</div>
            <div class="field"><span class="field-label">End Date:</span> ${selectedLease.end_date}</div>
            <div class="field"><span class="field-label">Monthly Rent:</span> KES ${Number(selectedLease.rent_amount).toLocaleString()}</div>
            <div class="field"><span class="field-label">Deposit Amount:</span> KES ${Number(selectedLease.deposit_amount).toLocaleString()}</div>
            <div class="field"><span class="field-label">Payment Day:</span> ${selectedLease.rent_day || 'N/A'} of each month</div>
            <div class="field"><span class="field-label">Billing Cycle:</span> ${selectedLease.billing_cycle || 'Monthly'}</div>
            <div class="field"><span class="field-label">Status:</span> ${selectedLease.status.toUpperCase()}</div>
          </div>

          <div class="section">
            <div class="section-title">Terms & Conditions</div>
            <div class="terms">${editableTerms || 'No specific terms provided.'}</div>
          </div>

          <div class="section" style="margin-top: 60px;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <div>_____________________</div>
                <div>Landlord Signature</div>
                <div>Date: ____________</div>
              </div>
              <div>
                <div>_____________________</div>
                <div>Tenant Signature</div>
                <div>Date: ____________</div>
              </div>
            </div>
          </div>

          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #1976d2; color: white; border: none; cursor: pointer; border-radius: 4px;">Print / Save as PDF</button>
        </body>
      </html>
    `;

    printWindow.document.write(leaseDocument);
    printWindow.document.close();
  };

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Leases</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpenCreate(true)}>
          New Lease
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
              Failed to load leases: {error instanceof Error ? error.message : 'Unknown error'}
            </Typography>
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Lease #</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Start</TableCell>
                      <TableCell>End</TableCell>
                      <TableCell>Rent</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leases.map((lease: any) => (
                        <TableRow key={lease.id} hover>
                          <TableCell>{lease.lease_number || '-'}</TableCell>
                          <TableCell>
                            {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : '-'}
                          </TableCell>
                          <TableCell>
                            {lease.unit ? `${lease.unit.unit_number} ${lease.unit.property?.name ? `(${lease.unit.property?.name})` : ''}` : '-'}
                          </TableCell>
                          <TableCell>{lease.start_date}</TableCell>
                          <TableCell>{lease.end_date}</TableCell>
                          <TableCell>KES {Number(lease.rent_amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Label
                              color={
                                (lease.status === 'active' && 'success') ||
                                (lease.status === 'terminated' && 'error') ||
                                (lease.status === 'expired' && 'warning') ||
                                'default'
                              }
                            >
                              {lease.status}
                            </Label>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={(e) => handleMenuOpen(e, lease)}>
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
              count={totalLeases}
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
          <MenuItem onClick={handleViewLease}>
            <Iconify icon="solar:eye-bold" />
            View Lease
          </MenuItem>
          <MenuItem
            onClick={() => {
              setTerminateForm({ termination_date: '', termination_reason: '' });
              setOpenTerminate(true);
              handleMenuClose();
            }}
          >
            <Iconify icon="solar:restart-bold" />
            Terminate
          </MenuItem>
        </MenuList>
      </Popover>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Lease</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Tenant"
              value={formData.tenant_id}
              onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
              fullWidth
              required
            >
              {tenants.map((tenant: Tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.first_name} {tenant.last_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Vacant Unit"
              value={formData.unit_id}
              onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
              fullWidth
              required
            >
              {units.map((unit: any) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.unit_number} {unit.property?.name ? `(${unit.property?.name})` : ''}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Rent Amount"
                type="number"
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Deposit Amount"
                type="number"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Payment Day"
                type="number"
                value={formData.payment_day}
                onChange={(e) => setFormData({ ...formData, payment_day: e.target.value })}
                fullWidth
                required
              />
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                fullWidth
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </TextField>
            </Stack>

            <TextField
              label="Lease Terms"
              value={formData.lease_terms}
              onChange={(e) => setFormData({ ...formData, lease_terms: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create Lease</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTerminate} onClose={() => setOpenTerminate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Terminate Lease</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Termination Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={terminateForm.termination_date}
              onChange={(e) => setTerminateForm({ ...terminateForm, termination_date: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Termination Reason"
              value={terminateForm.termination_reason}
              onChange={(e) => setTerminateForm({ ...terminateForm, termination_reason: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTerminate(false)}>Cancel</Button>
          <Button onClick={handleTerminate} variant="contained">Terminate</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openLeaseView} onClose={() => setOpenLeaseView(false)} maxWidth="md" fullWidth>
        <DialogTitle>Lease Agreement - {selectedLease?.lease_number}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Organization Details</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLease?.unit?.property?.organization?.name || 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Tenant Details</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLease?.tenant?.first_name} {selectedLease?.tenant?.last_name}
                <br />
                Email: {selectedLease?.tenant?.email}
                <br />
                Phone: {selectedLease?.tenant?.phone || 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Property Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Property: {selectedLease?.unit?.property?.name || 'N/A'}
                <br />
                Unit: {selectedLease?.unit?.unit_number}
                <br />
                Rent: KES {Number(selectedLease?.rent_amount || 0).toLocaleString()}/month
                <br />
                Deposit: KES {Number(selectedLease?.deposit_amount || 0).toLocaleString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Lease Period</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLease?.start_date} to {selectedLease?.end_date}
              </Typography>
            </Box>

            <TextField
              label="Terms & Conditions (editable)"
              value={editableTerms}
              onChange={(e) => setEditableTerms(e.target.value)}
              fullWidth
              multiline
              minRows={8}
              helperText="Edit the terms before downloading"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeaseView(false)}>Cancel</Button>
          <Button onClick={handleDownloadLease} variant="contained" startIcon={<Iconify icon="solar:share-bold" />}>
            Download / Print
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
