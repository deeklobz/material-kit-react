import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { additionalChargeService } from 'src/services/additionalChargeService';
import { type Tenant, type TenantDetail, tenantService } from 'src/services/tenantService';
import { unitService } from 'src/services/unitService';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function TenantsView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState(0);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [vacateOpen, setVacateOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [violationOpen, setViolationOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
    date_of_birth: '',
    occupation: '',
    employer: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    status: 'active',
    assign_unit: false,
    unit_id: '',
    lease_start_date: '',
    lease_end_date: '',
    rent_amount: '',
    deposit_amount: '',
    payment_day: '5',
    lease_terms: '',
  });
  const [vacateForm, setVacateForm] = useState({
    termination_date: '',
    termination_reason: '',
  });
  const [refundForm, setRefundForm] = useState({
    lease_id: '',
    deposit_amount: '',
    deductions: '',
    refund_date: '',
    notes: '',
  });
  const [ratingForm, setRatingForm] = useState({
    rating: '5',
    notes: '',
    rated_at: '',
  });
  const [violationForm, setViolationForm] = useState({
    title: '',
    description: '',
    severity: 'low',
    reported_at: '',
    status: 'open',
    resolution_notes: '',
  });

  const { data: tenantsData, isLoading, error } = useQuery<Tenant[] | { data: Tenant[]; total: number }>({
    queryKey: ['tenants'],
    queryFn: tenantService.getAll,
  });

  const { data: tenantDetail, isLoading: tenantDetailLoading } = useQuery<TenantDetail>({
    queryKey: ['tenant', selectedTenantId],
    queryFn: () => tenantService.getById(selectedTenantId as string),
    enabled: !!selectedTenantId,
  });

  const { data: vacantUnits = [] } = useQuery({
    queryKey: ['vacant-units'],
    queryFn: () => unitService.getAll({ status: 'vacant' }),
  });

  const { data: chargesData } = useQuery({
    queryKey: ['additional-charges'],
    queryFn: () => additionalChargeService.getCharges(),
  });

  const deleteMutation = useMutation({
    mutationFn: tenantService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: tenantService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tenantService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });

  const vacateMutation = useMutation({
    mutationFn: ({ tenantId, payload }: { tenantId: string; payload: any }) =>
      tenantService.vacate(tenantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ tenantId, payload }: { tenantId: string; payload: any }) =>
      tenantService.refundDeposit(tenantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: ({ tenantId, payload }: { tenantId: string; payload: any }) =>
      tenantService.rate(tenantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });

  const violationMutation = useMutation({
    mutationFn: ({ tenantId, payload }: { tenantId: string; payload: any }) =>
      tenantService.addViolation(tenantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });

  const handleDeleteRow = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this tenant?')) {
        await deleteMutation.mutateAsync(id);
      }
    },
    [deleteMutation]
  );

  const tenants = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.data || []);
  const totalTenants = Array.isArray(tenantsData) ? tenantsData.length : (tenantsData?.total || 0);

  const currentLease = (tenantDetail as any)?.currentLease || (tenantDetail as any)?.current_lease;
  const tenantLeases = (tenantDetail as any)?.leases || [];
  const tenantRefunds = (tenantDetail as any)?.depositRefunds || (tenantDetail as any)?.deposit_refunds || [];
  const tenantViolations = (tenantDetail as any)?.violations || [];
  const tenantRatings = (tenantDetail as any)?.ratings || [];
  const tenantInvoices = (tenantDetail as any)?.invoices || [];
  const tenantPayments = (tenantDetail as any)?.payments || [];

  const tenantCharges = useMemo(() => {
    const charges = chargesData?.data || [];
    const leaseUnitId = currentLease?.unit_id;
    const leasePropertyId = currentLease?.unit?.property_id || currentLease?.unit?.property?.id;

    return charges.filter((charge: any) => {
      if (charge.scope === 'unit') {
        return charge.unit_id === leaseUnitId;
      }
      if (charge.scope === 'property') {
        return charge.property_id === leasePropertyId;
      }
      return false;
    });
  }, [chargesData, currentLease]);

  const handleOpenDetails = (id: string) => {
    setSelectedTenantId(id);
    setDetailsOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setTenantForm({
      first_name: tenant.first_name || '',
      last_name: tenant.last_name || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      id_number: tenant.id_number || '',
      date_of_birth: tenant.date_of_birth || '',
      occupation: tenant.occupation || '',
      employer: tenant.employer || '',
      emergency_contact_name: (tenant as any).emergency_contact_name || '',
      emergency_contact_phone: (tenant as any).emergency_contact_phone || '',
      status: tenant.status || 'active',
      assign_unit: false,
      unit_id: '',
      lease_start_date: '',
      lease_end_date: '',
      rent_amount: '',
      deposit_amount: '',
      payment_day: '5',
      lease_terms: '',
    });
    setEditOpen(true);
  };

  const handleCreateTenant = useCallback(async () => {
    try {
      if (tenantForm.assign_unit) {
        if (!tenantForm.unit_id || !tenantForm.lease_start_date || !tenantForm.lease_end_date) {
          alert('Please select a unit and lease dates.');
          return;
        }
        if (!tenantForm.rent_amount || !tenantForm.deposit_amount || !tenantForm.payment_day) {
          alert('Rent amount, deposit amount and payment day are required.');
          return;
        }
      }

      const payload: any = {
        first_name: tenantForm.first_name.trim(),
        last_name: tenantForm.last_name.trim(),
        email: tenantForm.email.trim(),
        phone: tenantForm.phone.trim(),
        id_number: tenantForm.id_number || undefined,
        date_of_birth: tenantForm.date_of_birth || undefined,
        occupation: tenantForm.occupation || undefined,
        employer: tenantForm.employer || undefined,
        emergency_contact_name: tenantForm.emergency_contact_name || undefined,
        emergency_contact_phone: tenantForm.emergency_contact_phone || undefined,
        status: tenantForm.status as any,
      };

      if (tenantForm.assign_unit && tenantForm.unit_id) {
        payload.lease = {
          unit_id: tenantForm.unit_id,
          start_date: tenantForm.lease_start_date,
          end_date: tenantForm.lease_end_date,
          rent_amount: Number(tenantForm.rent_amount),
          deposit_amount: Number(tenantForm.deposit_amount),
          payment_day: Number(tenantForm.payment_day),
          lease_terms: tenantForm.lease_terms || undefined,
          status: 'active',
        };
      }

      await createTenantMutation.mutateAsync(payload);

      setCreateOpen(false);
      setTenantForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_number: '',
        date_of_birth: '',
        occupation: '',
        employer: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        status: 'active',
        assign_unit: false,
        unit_id: '',
        lease_start_date: '',
        lease_end_date: '',
        rent_amount: '',
        deposit_amount: '',
        payment_day: '5',
        lease_terms: '',
      });
    } catch (err: any) {
      const message = err?.response?.data?.message ||
        err?.response?.data?.errors ||
        err?.message ||
        'Failed to create tenant.';
      alert(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, [createTenantMutation, tenantForm]);

  const handleUpdateTenant = useCallback(async () => {
    if (!editingTenant) return;
    try {
      const payload: any = {
        first_name: tenantForm.first_name.trim(),
        last_name: tenantForm.last_name.trim(),
        email: tenantForm.email.trim(),
        phone: tenantForm.phone.trim(),
        id_number: tenantForm.id_number || undefined,
        date_of_birth: tenantForm.date_of_birth || undefined,
        occupation: tenantForm.occupation || undefined,
        employer: tenantForm.employer || undefined,
        emergency_contact_name: tenantForm.emergency_contact_name || undefined,
        emergency_contact_phone: tenantForm.emergency_contact_phone || undefined,
        status: tenantForm.status as any,
      };

      await updateTenantMutation.mutateAsync({ id: editingTenant.id, data: payload });
      setEditOpen(false);
      setEditingTenant(null);
    } catch (err: any) {
      const message = err?.response?.data?.message ||
        err?.response?.data?.errors ||
        err?.message ||
        'Failed to update tenant.';
      alert(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, [editingTenant, tenantForm, updateTenantMutation]);

  const handleVacate = useCallback(async () => {
    if (!selectedTenantId) return;
    try {
      await vacateMutation.mutateAsync({
        tenantId: selectedTenantId,
        payload: {
          termination_date: vacateForm.termination_date,
          termination_reason: vacateForm.termination_reason || undefined,
        },
      });
      setVacateOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to vacate tenant.';
      alert(message);
    }
  }, [selectedTenantId, vacateForm, vacateMutation]);

  const handleRefund = useCallback(async () => {
    if (!selectedTenantId) return;
    try {
      await refundMutation.mutateAsync({
        tenantId: selectedTenantId,
        payload: {
          lease_id: refundForm.lease_id,
          deposit_amount: Number(refundForm.deposit_amount),
          deductions: refundForm.deductions ? Number(refundForm.deductions) : 0,
          refund_date: refundForm.refund_date,
          notes: refundForm.notes || undefined,
        },
      });
      setRefundOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to refund deposit.';
      alert(message);
    }
  }, [selectedTenantId, refundForm, refundMutation]);

  const handleRating = useCallback(async () => {
    if (!selectedTenantId) return;
    try {
      await ratingMutation.mutateAsync({
        tenantId: selectedTenantId,
        payload: {
          rating: Number(ratingForm.rating),
          notes: ratingForm.notes || undefined,
          rated_at: ratingForm.rated_at || undefined,
        },
      });
      setRatingOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to rate tenant.';
      alert(message);
    }
  }, [selectedTenantId, ratingForm, ratingMutation]);

  const handleViolation = useCallback(async () => {
    if (!selectedTenantId) return;
    try {
      await violationMutation.mutateAsync({
        tenantId: selectedTenantId,
        payload: {
          title: violationForm.title,
          description: violationForm.description || undefined,
          severity: violationForm.severity as any,
          reported_at: violationForm.reported_at || undefined,
          status: violationForm.status as any,
          resolution_notes: violationForm.resolution_notes || undefined,
        },
      });
      setViolationOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to add violation.';
      alert(message);
    }
  }, [selectedTenantId, violationForm, violationMutation]);

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Tenants</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateOpen(true)}
        >
          New Tenant
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
              Failed to load tenants: {error instanceof Error ? error.message : 'Unknown error'}
            </Typography>
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox />
                      </TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Tenant Code</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Move-in Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenants
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((tenant) => (
                        <TenantTableRow
                          key={tenant.id}
                          tenant={tenant}
                          onDelete={() => handleDeleteRow(tenant.id)}
                          onView={() => handleOpenDetails(tenant.id)}
                          onEdit={() => handleEditTenant(tenant)}
                        />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={totalTenants}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={(e) => {
                setPage(0);
                setRowsPerPage(parseInt(e.target.value, 10));
              }}
            />
          </>
        )}
      </Card>

      {/* Create Tenant Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Tenant</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First Name"
                value={tenantForm.first_name}
                onChange={(e) => setTenantForm({ ...tenantForm, first_name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={tenantForm.last_name}
                onChange={(e) => setTenantForm({ ...tenantForm, last_name: e.target.value })}
                fullWidth
                required
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                value={tenantForm.email}
                onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Phone"
                value={tenantForm.phone}
                onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                fullWidth
                required
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="ID Number"
                value={tenantForm.id_number}
                onChange={(e) => setTenantForm({ ...tenantForm, id_number: e.target.value })}
                fullWidth
              />
              <TextField
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={tenantForm.date_of_birth}
                onChange={(e) => setTenantForm({ ...tenantForm, date_of_birth: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Occupation"
                value={tenantForm.occupation}
                onChange={(e) => setTenantForm({ ...tenantForm, occupation: e.target.value })}
                fullWidth
              />
              <TextField
                label="Employer"
                value={tenantForm.employer}
                onChange={(e) => setTenantForm({ ...tenantForm, employer: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Emergency Contact Name"
                value={tenantForm.emergency_contact_name}
                onChange={(e) =>
                  setTenantForm({ ...tenantForm, emergency_contact_name: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Emergency Contact Phone"
                value={tenantForm.emergency_contact_phone}
                onChange={(e) =>
                  setTenantForm({ ...tenantForm, emergency_contact_phone: e.target.value })
                }
                fullWidth
              />
            </Stack>
            <TextField
              select
              label="Status"
              value={tenantForm.status}
              onChange={(e) => setTenantForm({ ...tenantForm, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="blacklisted">Blacklisted</MenuItem>
            </TextField>

            <Divider />

            <Stack direction="row" spacing={2} alignItems="center">
              <Checkbox
                checked={tenantForm.assign_unit}
                onChange={(e) => setTenantForm({ ...tenantForm, assign_unit: e.target.checked })}
              />
              <Typography>Assign to Vacant Unit</Typography>
            </Stack>

            {tenantForm.assign_unit && (
              <Stack spacing={2}>
                <TextField
                  select
                  label="Vacant Unit"
                  value={tenantForm.unit_id}
                  onChange={(e) => setTenantForm({ ...tenantForm, unit_id: e.target.value })}
                  fullWidth
                >
                  {vacantUnits.map((unit: any) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.unit_number} {unit.property?.name ? `(${unit.property?.name})` : ''}
                    </MenuItem>
                  ))}
                </TextField>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Lease Start"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={tenantForm.lease_start_date}
                    onChange={(e) => setTenantForm({ ...tenantForm, lease_start_date: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Lease End"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={tenantForm.lease_end_date}
                    onChange={(e) => setTenantForm({ ...tenantForm, lease_end_date: e.target.value })}
                    fullWidth
                    required
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Rent Amount"
                    type="number"
                    value={tenantForm.rent_amount}
                    onChange={(e) => setTenantForm({ ...tenantForm, rent_amount: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Deposit Amount"
                    type="number"
                    value={tenantForm.deposit_amount}
                    onChange={(e) => setTenantForm({ ...tenantForm, deposit_amount: e.target.value })}
                    fullWidth
                    required
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Payment Day"
                    type="number"
                    value={tenantForm.payment_day}
                    onChange={(e) => setTenantForm({ ...tenantForm, payment_day: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Lease Terms"
                    value={tenantForm.lease_terms}
                    onChange={(e) => setTenantForm({ ...tenantForm, lease_terms: e.target.value })}
                    fullWidth
                  />
                </Stack>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTenant}>Create Tenant</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Tenant</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First Name"
                value={tenantForm.first_name}
                onChange={(e) => setTenantForm({ ...tenantForm, first_name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={tenantForm.last_name}
                onChange={(e) => setTenantForm({ ...tenantForm, last_name: e.target.value })}
                fullWidth
                required
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                value={tenantForm.email}
                onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Phone"
                value={tenantForm.phone}
                onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                fullWidth
                required
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="ID Number"
                value={tenantForm.id_number}
                onChange={(e) => setTenantForm({ ...tenantForm, id_number: e.target.value })}
                fullWidth
              />
              <TextField
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={tenantForm.date_of_birth}
                onChange={(e) => setTenantForm({ ...tenantForm, date_of_birth: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Occupation"
                value={tenantForm.occupation}
                onChange={(e) => setTenantForm({ ...tenantForm, occupation: e.target.value })}
                fullWidth
              />
              <TextField
                label="Employer"
                value={tenantForm.employer}
                onChange={(e) => setTenantForm({ ...tenantForm, employer: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Emergency Contact Name"
                value={tenantForm.emergency_contact_name}
                onChange={(e) =>
                  setTenantForm({ ...tenantForm, emergency_contact_name: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Emergency Contact Phone"
                value={tenantForm.emergency_contact_phone}
                onChange={(e) =>
                  setTenantForm({ ...tenantForm, emergency_contact_phone: e.target.value })
                }
                fullWidth
              />
            </Stack>
            <TextField
              select
              label="Status"
              value={tenantForm.status}
              onChange={(e) => setTenantForm({ ...tenantForm, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="blacklisted">Blacklisted</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateTenant}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', md: 560 } } }}
      >
        <Box sx={{ p: 3 }}>
          {tenantDetailLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>
                  {tenantDetail?.first_name?.charAt(0)}
                  {tenantDetail?.last_name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {tenantDetail?.first_name} {tenantDetail?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tenantDetail?.email}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setVacateForm({
                      termination_date: '',
                      termination_reason: '',
                    });
                    setVacateOpen(true);
                  }}
                >
                  Vacate
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRefundForm({
                      lease_id: currentLease?.id || '',
                      deposit_amount: currentLease?.deposit_amount?.toString() || '',
                      deductions: '',
                      refund_date: '',
                      notes: '',
                    });
                    setRefundOpen(true);
                  }}
                >
                  Refund Deposit
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRatingForm({ rating: '5', notes: '', rated_at: '' });
                    setRatingOpen(true);
                  }}
                >
                  Rate
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setViolationForm({
                      title: '',
                      description: '',
                      severity: 'low',
                      reported_at: '',
                      status: 'open',
                      resolution_notes: '',
                    });
                    setViolationOpen(true);
                  }}
                >
                  Add Violation
                </Button>
              </Stack>

              <Tabs value={detailsTab} onChange={(_, v) => setDetailsTab(v)} sx={{ mt: 2 }}>
                <Tab label="Overview" />
                <Tab label="Invoices" />
                <Tab label="Payments" />
                <Tab label="Charges" />
                <Tab label="Violations" />
                <Tab label="Ratings" />
                <Tab label="Refunds" />
              </Tabs>

              <Divider sx={{ my: 2 }} />

              {detailsTab === 0 && (
                <Stack spacing={1}>
                  <Typography><strong>Phone:</strong> {tenantDetail?.phone}</Typography>
                  <Typography><strong>ID:</strong> {tenantDetail?.id_number || '-'}</Typography>
                  <Typography><strong>Status:</strong> {tenantDetail?.status}</Typography>
                  <Typography><strong>Current Lease:</strong> {currentLease?.lease_number || '-'}</Typography>
                  <Typography><strong>Unit:</strong> {currentLease?.unit?.unit_number || '-'}</Typography>
                </Stack>
              )}

              {detailsTab === 1 && (
                <Stack spacing={1}>
                  {tenantInvoices.map((inv: any) => (
                    <Card key={inv.id} sx={{ p: 2 }}>
                      <Typography variant="subtitle2">{inv.invoice_number}</Typography>
                      <Typography variant="body2">Status: {inv.status}</Typography>
                      <Typography variant="body2">Total: KES {inv.total_amount}</Typography>
                    </Card>
                  ))}
                </Stack>
              )}

              {detailsTab === 2 && (
                <Stack spacing={1}>
                  {tenantPayments.map((pay: any) => (
                    <Card key={pay.id} sx={{ p: 2 }}>
                      <Typography variant="subtitle2">{pay.payment_number}</Typography>
                      <Typography variant="body2">Amount: KES {pay.amount}</Typography>
                      <Typography variant="body2">Date: {pay.payment_date}</Typography>
                    </Card>
                  ))}
                </Stack>
              )}

              {detailsTab === 3 && (
                <Stack spacing={1}>
                  {tenantCharges.map((charge: any) => (
                    <Card key={charge.id} sx={{ p: 2 }}>
                      <Typography variant="subtitle2">{charge.name}</Typography>
                      <Typography variant="body2">Amount: KES {charge.amount}</Typography>
                      <Typography variant="body2">
                        {charge.billing_type === 'recurring' ? `Recurring (${charge.frequency})` : 'One-time'}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              )}

              {detailsTab === 4 && (
                <Stack spacing={1}>
                  {tenantViolations.map((v: any) => (
                    <Card key={v.id} sx={{ p: 2 }}>
                      <Typography variant="subtitle2">{v.title}</Typography>
                      <Typography variant="body2">Severity: {v.severity}</Typography>
                      <Typography variant="body2">Status: {v.status}</Typography>
                    </Card>
                  ))}
                </Stack>
              )}

              {detailsTab === 5 && (
                <Stack spacing={1}>
                  {tenantRatings.map((r: any) => (
                    <Card key={r.id} sx={{ p: 2 }}>
                      <Typography variant="subtitle2">Rating: {r.rating}/5</Typography>
                      <Typography variant="body2">{r.notes || '-'}</Typography>
                    </Card>
                  ))}
                </Stack>
              )}

              {detailsTab === 6 && (
                <Stack spacing={1}>
                  {tenantRefunds.map((d: any) => (
                    <Card key={d.id} sx={{ p: 2 }}>
                      <Typography variant="subtitle2">Refunded: KES {d.refunded_amount}</Typography>
                      <Typography variant="body2">Deductions: KES {d.deductions}</Typography>
                      <Typography variant="body2">Date: {d.refund_date}</Typography>
                    </Card>
                  ))}
                </Stack>
              )}
            </>
          )}
        </Box>
      </Drawer>

      {/* Vacate Dialog */}
      <Dialog open={vacateOpen} onClose={() => setVacateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Vacate Tenant</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Termination Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={vacateForm.termination_date}
              onChange={(e) => setVacateForm({ ...vacateForm, termination_date: e.target.value })}
              fullWidth
            />
            <TextField
              label="Reason"
              value={vacateForm.termination_reason}
              onChange={(e) => setVacateForm({ ...vacateForm, termination_reason: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVacateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleVacate}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundOpen} onClose={() => setRefundOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Refund Deposit</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Lease"
              value={refundForm.lease_id}
              onChange={(e) => setRefundForm({ ...refundForm, lease_id: e.target.value })}
              fullWidth
            >
              {tenantLeases.map((lease: any) => (
                <MenuItem key={lease.id} value={lease.id}>
                  {lease.lease_number || lease.id}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Deposit Amount"
              type="number"
              value={refundForm.deposit_amount}
              onChange={(e) => setRefundForm({ ...refundForm, deposit_amount: e.target.value })}
              fullWidth
            />
            <TextField
              label="Deductions"
              type="number"
              value={refundForm.deductions}
              onChange={(e) => setRefundForm({ ...refundForm, deductions: e.target.value })}
              fullWidth
            />
            <TextField
              label="Refund Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={refundForm.refund_date}
              onChange={(e) => setRefundForm({ ...refundForm, refund_date: e.target.value })}
              fullWidth
            />
            <TextField
              label="Notes"
              value={refundForm.notes}
              onChange={(e) => setRefundForm({ ...refundForm, notes: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRefund}>Refund</Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingOpen} onClose={() => setRatingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Tenant</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Rating (1-5)"
              type="number"
              value={ratingForm.rating}
              onChange={(e) => setRatingForm({ ...ratingForm, rating: e.target.value })}
              fullWidth
            />
            <TextField
              label="Notes"
              value={ratingForm.notes}
              onChange={(e) => setRatingForm({ ...ratingForm, notes: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Rated At"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={ratingForm.rated_at}
              onChange={(e) => setRatingForm({ ...ratingForm, rated_at: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRating}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Violation Dialog */}
      <Dialog open={violationOpen} onClose={() => setViolationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Violation</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={violationForm.title}
              onChange={(e) => setViolationForm({ ...violationForm, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={violationForm.description}
              onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              select
              label="Severity"
              value={violationForm.severity}
              onChange={(e) => setViolationForm({ ...violationForm, severity: e.target.value })}
              fullWidth
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <TextField
              label="Reported At"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={violationForm.reported_at}
              onChange={(e) => setViolationForm({ ...violationForm, reported_at: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={violationForm.status}
              onChange={(e) => setViolationForm({ ...violationForm, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </TextField>
            <TextField
              label="Resolution Notes"
              value={violationForm.resolution_notes}
              onChange={(e) => setViolationForm({ ...violationForm, resolution_notes: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViolationOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleViolation}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function TenantTableRow({ tenant, onDelete, onView, onEdit }: { tenant: Tenant; onDelete: () => void; onView: () => void; onEdit: () => void }) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <Checkbox />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar>
              {tenant.first_name.charAt(0)}
              {tenant.last_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {tenant.first_name} {tenant.last_name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {tenant.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>{tenant.phone}</TableCell>
        <TableCell>{tenant.tenant_code}</TableCell>
        <TableCell>
          <Label
            color={
              (tenant.status === 'active' && 'success') ||
              (tenant.status === 'blacklisted' && 'error') ||
              (tenant.status === 'suspended' && 'warning') ||
              'default'
            }
          >
            {tenant.status}
          </Label>
        </TableCell>
        <TableCell>{tenant.move_in_date || '-'}</TableCell>
        <TableCell align="right">
          <IconButton onClick={(e) => setOpenPopover(e.currentTarget)}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={() => setOpenPopover(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
            },
          }}
        >
          <MenuItem onClick={onEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          <MenuItem onClick={onView}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
          <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
