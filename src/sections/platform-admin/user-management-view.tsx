import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Button,
  Dialog,
  Select,
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
  InputLabel,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { organizationService } from '../../services/organizationService';
import userManagementService from '../../services/userManagementService';

import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../services/userManagementService';

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  organization_id: string;
  phone: string;
}

export default function UserManagementView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: '',
    organization_id: '',
    phone: '',
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', page, filterRole, filterStatus, searchQuery],
    queryFn: () =>
      userManagementService.getUsers({
        page: page + 1,
        role: filterRole || undefined,
        status: filterStatus as any,
        search: searchQuery || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: userManagementService.getStats,
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations-all'],
    queryFn: organizationService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: userManagementService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      setDialogOpen(false);
      resetForm();
      showSuccess('User created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userManagementService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
      resetForm();
      showSuccess('User updated successfully');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: userManagementService.suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      showSuccess('User suspended successfully');
    },
  });

  const activateMutation = useMutation({
    mutationFn: userManagementService.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      showSuccess('User activated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userManagementService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      showSuccess('User deleted successfully');
    },
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: '',
        role: user.role,
        organization_id: user.organization_id?.toString() || '',
        phone: user.phone || '',
      });
    } else {
      setEditingUser(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: '',
      organization_id: '',
      phone: '',
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const data: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      role: formData.role,
      organization_id: formData.organization_id ? parseInt(formData.organization_id, 10) : undefined,
      phone: formData.phone || undefined,
    };

    if (formData.password) {
      data.password = formData.password;
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    } else {
      createMutation.mutate(data as CreateUserRequest);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleSuspend = () => {
    if (selectedUser) {
      suspendMutation.mutate(selectedUser.id);
    }
    handleMenuClose();
  };

  const handleActivate = () => {
    if (selectedUser) {
      activateMutation.mutate(selectedUser.id);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedUser && confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(selectedUser.id);
    }
    handleMenuClose();
  };

  const users = usersData?.data || [];
  const totalUsers = usersData?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add User
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Total Users
            </Typography>
            <Typography variant="h4">{stats.total_users}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Active Users
            </Typography>
            <Typography variant="h4">{stats.active_users}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Suspended
            </Typography>
            <Typography variant="h4">{stats.suspended_users}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              New This Month
            </Typography>
            <Typography variant="h4">{stats.new_users_this_month}</Typography>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            label="Role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="platform_admin">Platform Admin</MenuItem>
            <MenuItem value="property_manager">Property Manager</MenuItem>
            <MenuItem value="caretaker">Caretaker</MenuItem>
            <MenuItem value="tenant">Tenant</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </TextField>
        </Box>
      </Card>

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" />
                  </TableCell>
                  <TableCell>{user.organization?.name || '-'}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status === 'active' ? 'Active' : 'Suspended'}
                      color={user.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
          <MenuItem onClick={() => { handleOpenDialog(selectedUser!); handleMenuClose(); }}>
            Edit
          </MenuItem>
          {selectedUser?.status === 'active' ? (
            <MenuItem onClick={handleSuspend}>Suspend</MenuItem>
          ) : (
            <MenuItem onClick={handleActivate}>Activate</MenuItem>
          )}
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      {/* User Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                helperText={editingUser ? 'Leave blank to keep current password' : ''}
              />
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="platform_admin">Platform Admin</MenuItem>
                  <MenuItem value="organization_admin">Organization Admin</MenuItem>
                  <MenuItem value="property_manager">Property Manager</MenuItem>
                  <MenuItem value="caretaker">Caretaker</MenuItem>
                  <MenuItem value="tenant">Tenant</MenuItem>
                  <MenuItem value="vendor">Vendor</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={formData.organization_id}
                  label="Organization"
                  onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {organizations?.map((org: any) => (
                    <MenuItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
