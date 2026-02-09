import { useMemo, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { unitService } from 'src/services/unitService';
import { vendorService } from 'src/services/vendorService';
import { propertyService } from 'src/services/propertyService';
import { staffManagementService } from 'src/services/staffManagementService';
import {
  type WorkOrder,
  workOrderService,
  type WorkOrderStatus,
  type WorkOrderCategory,
  type WorkOrderPriority,
} from 'src/services/workOrderService';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const CATEGORY_OPTIONS: { value: WorkOrderCategory; label: string }[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'structural', label: 'Structural' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'general', label: 'General' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS: { value: WorkOrderPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_OPTIONS: { value: WorkOrderStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
];

function statusLabelColor(status: WorkOrderStatus): any {
  switch (status) {
    case 'open':
      return 'warning';
    case 'in_progress':
      return 'info';
    case 'on_hold':
      return 'default';
    case 'completed':
      return 'success';
    case 'canceled':
      return 'error';
    default:
      return 'default';
  }
}

function formatMoney(value: any): string {
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

export function WorkOrdersView() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [filters, setFilters] = useState<{ property_id: string; status: string; priority: string; category: string }>(
    {
      property_id: '',
      status: '',
      priority: '',
      category: '',
    }
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<WorkOrder | null>(null);

  const [form, setForm] = useState({
    property_id: '',
    unit_id: '',
    title: '',
    description: '',
    category: 'general' as WorkOrderCategory,
    priority: 'medium' as WorkOrderPriority,
    status: 'open' as WorkOrderStatus,
    vendor_id: '',
    assigned_to: '',
    scheduled_date: '',
    estimated_cost: '',
    actual_cost: '',
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyService.getAll,
  });

  const { data: vendorsResp } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorService.getAll({ status: 'active' }),
  });

  const vendors = useMemo(() => {
    const d: any = vendorsResp as any;
    if (!d) return [];
    return Array.isArray(d) ? d : (d.data || []);
  }, [vendorsResp]);

  const { data: staff = [] } = useQuery({
    queryKey: ['organization-staff'],
    queryFn: () => staffManagementService.getStaffMembers(),
  });

  const selectedPropertyId = form.property_id || filters.property_id;

  const { data: units = [] } = useQuery({
    queryKey: ['units', selectedPropertyId],
    queryFn: () => unitService.getAll({ property_id: selectedPropertyId }),
    enabled: !!selectedPropertyId,
  });

  const listParams = useMemo(
    () => ({
      page: page + 1,
      per_page: rowsPerPage,
      property_id: filters.property_id || undefined,
      status: (filters.status as WorkOrderStatus) || undefined,
      priority: (filters.priority as WorkOrderPriority) || undefined,
      category: (filters.category as WorkOrderCategory) || undefined,
    }),
    [filters, page, rowsPerPage]
  );

  const {
    data: workOrdersPage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['work-orders', listParams],
    queryFn: () => workOrderService.getAll(listParams),
  });

  const workOrders = workOrdersPage?.data || [];
  const total = workOrdersPage?.total || 0;

  const createMutation = useMutation({
    mutationFn: () =>
      workOrderService.create({
        property_id: form.property_id,
        unit_id: form.unit_id || undefined,
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        status: form.status,
        vendor_id: form.vendor_id || undefined,
        assigned_to: form.assigned_to || undefined,
        scheduled_date: form.scheduled_date || undefined,
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      workOrderService.update(editing!.id, {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        status: form.status,
        vendor_id: form.vendor_id ? form.vendor_id : null,
        assigned_to: form.assigned_to ? form.assigned_to : null,
        scheduled_date: form.scheduled_date ? form.scheduled_date : null,
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
        actual_cost: form.actual_cost ? Number(form.actual_cost) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setEditOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workOrderService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['work-orders'] }),
  });

  const resetForm = useCallback(() => {
    setForm({
      property_id: '',
      unit_id: '',
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      status: 'open',
      vendor_id: '',
      assigned_to: '',
      scheduled_date: '',
      estimated_cost: '',
      actual_cost: '',
    });
  }, []);

  const openCreate = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (wo: WorkOrder) => {
    setEditing(wo);
    setForm({
      property_id: wo.property_id || '',
      unit_id: wo.unit_id || '',
      title: wo.title || '',
      description: wo.description || '',
      category: wo.category,
      priority: wo.priority,
      status: wo.status,
      vendor_id: wo.vendor_id || '',
      assigned_to: wo.assigned_to || '',
      scheduled_date: wo.scheduled_date ? String(wo.scheduled_date).slice(0, 10) : '',
      estimated_cost: wo.estimated_cost != null ? String(wo.estimated_cost) : '',
      actual_cost: wo.actual_cost != null ? String(wo.actual_cost) : '',
    });
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this work order?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const propertyOptions = properties || [];

  return (
    <Box sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Work Orders</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Track maintenance tasks, assignments, costs, and status.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
          New Work Order
        </Button>
      </Stack>

      <Card>
        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select
                value={filters.property_id}
                label="Property"
                onChange={(e) => {
                  setPage(0);
                  setFilters((p) => ({ ...p, property_id: String(e.target.value) }));
                }}
              >
                <MenuItem value="">All</MenuItem>
                {propertyOptions.map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => {
                  setPage(0);
                  setFilters((p) => ({ ...p, status: String(e.target.value) }));
                }}
              >
                <MenuItem value="">All</MenuItem>
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => {
                  setPage(0);
                  setFilters((p) => ({ ...p, priority: String(e.target.value) }));
                }}
              >
                <MenuItem value="">All</MenuItem>
                {PRIORITY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => {
                  setPage(0);
                  setFilters((p) => ({ ...p, category: String(e.target.value) }));
                }}
              >
                <MenuItem value="">All</MenuItem>
                {CATEGORY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Divider />

        <TableContainer>
          <Scrollbar>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Property / Unit</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Est. Cost</TableCell>
                  <TableCell align="right">Actual</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && (error as any) && (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ py: 3 }}>
                      <Typography color="error">Failed to load work orders.</Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !error && workOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ py: 5 }} align="center">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No work orders found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {workOrders.map((wo) => (
                  <TableRow key={wo.id} hover>
                    <TableCell>{wo.ticket_number}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{wo.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Created {formatDate(wo.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{wo.property?.name || '-'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {wo.unit?.unit_number ? `Unit ${wo.unit.unit_number}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{CATEGORY_OPTIONS.find((c) => c.value === wo.category)?.label || wo.category}</TableCell>
                    <TableCell>{PRIORITY_OPTIONS.find((p) => p.value === wo.priority)?.label || wo.priority}</TableCell>
                    <TableCell>
                      <Label color={statusLabelColor(wo.status)}>{STATUS_OPTIONS.find((s) => s.value === wo.status)?.label || wo.status}</Label>
                    </TableCell>
                    <TableCell align="right">{wo.estimated_cost != null ? formatMoney(wo.estimated_cost) : '-'}</TableCell>
                    <TableCell align="right">{wo.actual_cost != null ? formatMoney(wo.actual_cost) : '-'}</TableCell>
                    <TableCell>{formatDate(wo.scheduled_date)}</TableCell>
                    <TableCell>{(wo.assignedTo as any)?.name || (wo as any)?.assigned_to_user?.name || '-'}</TableCell>
                    <TableCell>{wo.vendor?.name || '-'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => openEdit(wo)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(wo.id)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Create */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Work Order</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Property</InputLabel>
                <Select
                  value={form.property_id}
                  label="Property"
                  onChange={(e) => {
                    setForm((p) => ({ ...p, property_id: String(e.target.value), unit_id: '' }));
                  }}
                >
                  {propertyOptions.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Unit (optional)</InputLabel>
                <Select
                  value={form.unit_id}
                  label="Unit (optional)"
                  onChange={(e) => setForm((p) => ({ ...p, unit_id: String(e.target.value) }))}
                  disabled={!form.property_id}
                >
                  <MenuItem value="">None</MenuItem>
                  {units.map((u: any) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.unit_number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={form.category} label="Category" onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as any }))}>
                  {CATEGORY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} label="Priority" onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as any }))}>
                  {PRIORITY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}>
                  {STATUS_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Assigned To (optional)</InputLabel>
                <Select
                  value={form.assigned_to}
                  label="Assigned To (optional)"
                  onChange={(e) => setForm((p) => ({ ...p, assigned_to: String(e.target.value) }))}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {staff.map((s: any) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Vendor (optional)</InputLabel>
                <Select value={form.vendor_id} label="Vendor (optional)" onChange={(e) => setForm((p) => ({ ...p, vendor_id: String(e.target.value) }))}>
                  <MenuItem value="">None</MenuItem>
                  {vendors.map((v: any) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Scheduled Date (optional)"
                type="date"
                value={form.scheduled_date}
                onChange={(e) => setForm((p) => ({ ...p, scheduled_date: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Estimated Cost (optional)"
                type="number"
                value={form.estimated_cost}
                onChange={(e) => setForm((p) => ({ ...p, estimated_cost: e.target.value }))}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={
              !form.property_id ||
              !form.title.trim() ||
              !form.description.trim() ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Work Order</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {!editing ? (
            <Typography sx={{ py: 2 }}>No work order selected.</Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Ticket" value={editing.ticket_number} fullWidth disabled />
                <TextField label="Property" value={editing.property?.name || editing.property_id} fullWidth disabled />
              </Stack>

              <TextField label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                fullWidth
                multiline
                minRows={3}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={form.category} label="Category" onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as any }))}>
                    {CATEGORY_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={form.priority} label="Priority" onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as any }))}>
                    {PRIORITY_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} label="Status" onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}>
                    {STATUS_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={form.assigned_to}
                    label="Assigned To"
                    onChange={(e) => setForm((p) => ({ ...p, assigned_to: String(e.target.value) }))}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {staff.map((s: any) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Vendor</InputLabel>
                  <Select value={form.vendor_id} label="Vendor" onChange={(e) => setForm((p) => ({ ...p, vendor_id: String(e.target.value) }))}>
                    <MenuItem value="">None</MenuItem>
                    {vendors.map((v: any) => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Scheduled Date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm((p) => ({ ...p, scheduled_date: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Estimated Cost"
                  type="number"
                  value={form.estimated_cost}
                  onChange={(e) => setForm((p) => ({ ...p, estimated_cost: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Actual Cost"
                  type="number"
                  value={form.actual_cost}
                  onChange={(e) => setForm((p) => ({ ...p, actual_cost: e.target.value }))}
                  fullWidth
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setEditOpen(false);
              setEditing(null);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => updateMutation.mutate()}
            disabled={!editing || !form.title.trim() || !form.description.trim() || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
