import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Card,
  Chip,
  Table,
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
} from '@mui/material';

import propertyManagementService from '../../services/propertyManagementService';

export default function PropertyManagementView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    city: '',
    county: '',
  });

  const { data: propertiesData, isLoading, error } = useQuery({
    queryKey: ['admin-properties', page],
    queryFn: () =>
      propertyManagementService.getProperties({
        page: page + 1,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['property-stats'],
    queryFn: propertyManagementService.getStats,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, property: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProperty(null);
  };

  const handleAdd = () => {
    setFormData({ name: '', code: '', type: '', city: '', county: '' });
    setSelectedProperty(null);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedProperty) {
      setFormData({
        name: selectedProperty.name || '',
        code: selectedProperty.code || '',
        type: selectedProperty.type || '',
        city: selectedProperty.city || '',
        county: selectedProperty.county || '',
      });
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedProperty && confirm('Are you sure you want to delete this property?')) {
      console.log('Delete property:', selectedProperty);
      // TODO: Implement actual delete
    }
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormData({ name: '', code: '', type: '', city: '', county: '' });
    setSelectedProperty(null);
  };

  const handleDialogSave = () => {
    if (selectedProperty) {
      console.log('Update property:', selectedProperty.id, formData);
      // TODO: Implement actual update
    } else {
      console.log('Create property:', formData);
      // TODO: Implement actual create
    }
    handleDialogClose();
  };

  const properties = propertiesData?.data || [];
  const totalProperties = propertiesData?.total || 0;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading properties: {String(error)}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Property Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Property
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Total Properties
            </Typography>
            <Typography variant="h4">{stats.total_properties}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Active
            </Typography>
            <Typography variant="h4">{stats.active_properties}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Total Units
            </Typography>
            <Typography variant="h4">{stats.total_units || 0}</Typography>
          </Card>
        </Box>
      )}

      {/* Properties Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Units</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No properties found
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property: any) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{property.name}</Typography>
                        {property.code && (
                          <Typography variant="caption" color="text.secondary">
                            {property.code}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{property.organization?.name || '-'}</TableCell>
                    <TableCell>
                      <Chip label={property.type} size="small" />
                    </TableCell>
                    <TableCell>
                      {property.city}, {property.county}
                    </TableCell>
                    <TableCell>
                      {property.occupied_units}/{property.total_units}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={property.status}
                        color={property.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, property)}>
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
          count={totalProperties}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
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
          {selectedProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
            />
            <TextField
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
            />
            <TextField
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              fullWidth
            />
            <TextField
              label="County"
              value={formData.county}
              onChange={(e) => setFormData({ ...formData, county: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained">
            {selectedProperty ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
