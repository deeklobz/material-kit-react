import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Card,
  Chip,
  Table,
  Alert,
  Stack,
  Button,
  Dialog,
  Popover,
  TableRow,
  MenuItem,
  MenuList,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import tenantManagementService from '../../services/tenantManagementService';

export default function TenantManagementView() {
  const [page, setPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const { data: tenantsData, isLoading, error } = useQuery({
    queryKey: ['admin-tenants', page],
    queryFn: () => tenantManagementService.getTenants({ page: page + 1 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-tenant-stats'],
    queryFn: tenantManagementService.getStats,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tenant: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedTenant(tenant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTenant(null);
  };

  const handleAdd = () => {
    setFormData({ first_name: '', last_name: '', email: '', phone: '' });
    setSelectedTenant(null);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedTenant) {
      setFormData({
        first_name: selectedTenant.first_name || '',
        last_name: selectedTenant.last_name || '',
        email: selectedTenant.email || '',
        phone: selectedTenant.phone || '',
      });
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedTenant && confirm('Are you sure you want to delete this tenant?')) {
      console.log('Delete tenant:', selectedTenant);
    }
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormData({ first_name: '', last_name: '', email: '', phone: '' });
    setSelectedTenant(null);
  };

  const handleDialogSave = () => {
    if (selectedTenant) {
      console.log('Update tenant:', selectedTenant.id, formData);
    } else {
      console.log('Create tenant:', formData);
    }
    handleDialogClose();
  };

  const tenants = tenantsData?.data || [];
  const totalTenants = tenantsData?.total || 0;

  console.log('Tenants Data:', { tenantsData, tenants, count: tenants.length });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'blacklisted':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading tenants: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tenant Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Tenant
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Total Tenants
            </Typography>
            <Typography variant="h4">{stats.total_tenants}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Active
            </Typography>
            <Typography variant="h4">{stats.active_tenants}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Inactive
            </Typography>
            <Typography variant="h4">{stats.inactive_tenants}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Blacklisted
            </Typography>
            <Typography variant="h4">{stats.blacklisted_tenants}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              New This Month
            </Typography>
            <Typography variant="h4">{stats.new_tenants_this_month}</Typography>
          </Card>
        </Box>
      )}

      {/* Tenants Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>ID Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No tenants found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant: any) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{`${tenant.first_name} ${tenant.last_name}`}</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell>{tenant.phone}</TableCell>
                    <TableCell>{tenant.organization?.name || '-'}</TableCell>
                    <TableCell>{tenant.id_number || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.status}
                        color={getStatusColor(tenant.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, tenant)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalTenants}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={15}
          rowsPerPageOptions={[15]}
        />
      </Card>

      {/* Actions Menu */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList>
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
              type="email"
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained">
            {selectedTenant ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

