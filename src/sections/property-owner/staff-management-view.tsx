import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// -----------------------------------------------------------------------

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  joinedDate: string;
  lastActivity: string;
}

export function StaffManagementView() {
  const [loading] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Property Manager',
      status: 'active',
      joinedDate: '2024-01-15',
      lastActivity: '2 hours ago',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Accountant',
      status: 'active',
      joinedDate: '2024-02-01',
      lastActivity: '1 day ago',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'property_manager',
    permission: 'view_all',
  });

  const handleOpenDialog = (member?: StaffMember) => {
    if (member) {
      setEditingId(member.id);
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role.toLowerCase().replace(' ', '_'),
        permission: 'view_all',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', role: 'property_manager', permission: 'view_all' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | any
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Call API to save staff member
      console.log('Saving staff member:', formData);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving staff member:', error);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      // TODO: Call API to suspend staff member
      console.log('Suspending staff member:', id);
    } catch (error) {
      console.error('Error suspending staff member:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        // TODO: Call API to delete staff member
        console.log('Deleting staff member:', id);
        setStaffMembers((prev) => prev.filter((m) => m.id !== id));
      } catch (error) {
        console.error('Error deleting staff member:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const roleColors: Record<string, 'default' | 'primary' | 'success' | 'info'> = {
    'Property Manager': 'primary',
    'Accountant': 'success',
    'Caretaker': 'info',
    'Support Agent': 'default',
  };

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Staff Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage team members and their permissions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Iconify icon="solar:pen-bold" />} onClick={() => handleOpenDialog()}>
          Invite Staff
        </Button>
      </Box>

      {/* Stats Cards */}
      <Stack spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Card sx={{ flex: 1, p: 2, minWidth: 150 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Staff
            </Typography>
            <Typography variant="h4">{staffMembers.length}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2, minWidth: 150 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Active
            </Typography>
            <Typography variant="h4" sx={{ color: 'success.main' }}>
              {staffMembers.filter((s) => s.status === 'active').length}
            </Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2, minWidth: 150 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Suspended
            </Typography>
            <Typography variant="h4" sx={{ color: 'warning.main' }}>
              {staffMembers.filter((s) => s.status === 'suspended').length}
            </Typography>
          </Card>
        </Box>
      </Stack>

      {/* Staff Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffMembers.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {member.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {member.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.role}
                      size="small"
                      color={roleColors[member.role] || 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.status}
                      size="small"
                      color={member.status === 'active' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {new Date(member.joinedDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {member.lastActivity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(member)}
                      title="Edit"
                    >
                      <Iconify icon="solar:pen-bold" sx={{ width: 18, height: 18 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleSuspend(member.id)}
                      title={member.status === 'active' ? 'Suspend' : 'Activate'}
                    >
                      <Iconify
                        icon={member.status === 'active' ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                        sx={{ width: 18, height: 18 }}
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(member.id)}
                      title="Remove"
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" sx={{ width: 18, height: 18, color: 'error.main' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Invite Staff Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Staff Member' : 'Invite Staff Member'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role} onChange={handleChange} label="Role">
                <MenuItem value="property_manager">Property Manager</MenuItem>
                <MenuItem value="accountant">Accountant</MenuItem>
                <MenuItem value="caretaker">Caretaker</MenuItem>
                <MenuItem value="support_agent">Support Agent</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Permission Level</InputLabel>
              <Select name="permission" value={formData.permission} onChange={handleChange} label="Permission Level">
                <MenuItem value="view_all">View All</MenuItem>
                <MenuItem value="view_edit">View & Edit</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? 'Update' : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
