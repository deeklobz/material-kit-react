import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

import {
  additionalChargeService,
  type AdditionalCharge,
  type ChargeBillingType,
  type ChargeFrequency,
  type ChargeScope,
  type ChargeStatus,
  type CreateAdditionalChargeRequest,
} from '../../services/additionalChargeService';
import { useAuth } from '../../context/AuthContext';
import { propertyService, type Property } from '../../services/propertyService';
import unitManagementService, { type CreateUnitRequest, type Unit } from '../../services/unitManagementService';

export default function UnitManagementView() {
  const { user } = useAuth();
  const isPlatformAdmin = user?.role === 'platform_admin';
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<AdditionalCharge | null>(null);
  const [formData, setFormData] = useState<{
    property_id: string;
    unit_number: string;
    type: CreateUnitRequest['type'];
    bedrooms: string;
    bathrooms: string;
    square_meters: string;
    floor: string;
    rent_amount: string;
    deposit_amount: string;
    status: Unit['status'];
    description: string;
  }>({
    property_id: '',
    unit_number: '',
    type: 'studio',
    bedrooms: '',
    bathrooms: '',
    square_meters: '',
    floor: '',
    rent_amount: '',
    deposit_amount: '',
    status: 'vacant',
    description: '',
  });
  const [chargeFormData, setChargeFormData] = useState<{
    scope: ChargeScope;
    property_id: string;
    unit_id: string;
    name: string;
    description: string;
    amount: string;
    billing_type: ChargeBillingType;
    frequency: ChargeFrequency;
    start_date: string;
    end_date: string;
    status: ChargeStatus;
  }>({
    scope: 'unit',
    property_id: '',
    unit_id: '',
    name: '',
    description: '',
    amount: '',
    billing_type: 'one_time',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    status: 'active',
  });

  const { data: unitsData, isLoading, error } = useQuery({
    queryKey: ['admin-units', page, isPlatformAdmin],
    queryFn: () =>
      isPlatformAdmin
        ? unitManagementService.getUnits({ page: page + 1 })
        : unitManagementService.getUnits({ page: page + 1 }),
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: propertyService.getAll,
  });

  const { data: unitOptionsData } = useQuery({
    queryKey: ['admin-units-options', isPlatformAdmin],
    queryFn: () =>
      isPlatformAdmin
        ? unitManagementService.getUnits({ page: 1, per_page: 100 })
        : unitManagementService.getUnits({ page: 1, per_page: 100 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-unit-stats'],
    queryFn: unitManagementService.getStats,
  });

  const { data: chargesData, isLoading: chargesLoading } = useQuery({
    queryKey: ['additional-charges'],
    queryFn: () => additionalChargeService.getCharges(),
  });

  const createMutation = useMutation({
    mutationFn: unitManagementService.createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-units'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unit-stats'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      unitManagementService.updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-units'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unit-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: unitManagementService.deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-units'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unit-stats'] });
    },
  });

  const createChargeMutation = useMutation({
    mutationFn: additionalChargeService.createCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-charges'] });
    },
  });

  const updateChargeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      additionalChargeService.updateCharge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-charges'] });
    },
  });

  const deleteChargeMutation = useMutation({
    mutationFn: additionalChargeService.deleteCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-charges'] });
    },
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, unit: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUnit(null);
  };

  const handleAdd = () => {
    setFormData({
      property_id: '',
      unit_number: '',
      type: 'studio',
      bedrooms: '',
      bathrooms: '',
      square_meters: '',
      floor: '',
      rent_amount: '',
      deposit_amount: '',
      status: 'vacant',
      description: '',
    });
    setSelectedUnit(null);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedUnit) {
      setFormData({
        property_id: selectedUnit.property_id || '',
        unit_number: selectedUnit.unit_number || '',
        type: selectedUnit.type || 'studio',
        bedrooms: selectedUnit.bedrooms?.toString() || '',
        bathrooms: selectedUnit.bathrooms?.toString() || '',
        square_meters: selectedUnit.square_meters?.toString() || '',
        floor: selectedUnit.floor || '',
        rent_amount: selectedUnit.rent_amount?.toString() || '',
        deposit_amount: selectedUnit.deposit_amount?.toString() || '',
        status: selectedUnit.status || 'vacant',
        description: selectedUnit.description || '',
      });
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = async () => {
    if (selectedUnit && confirm('Are you sure you want to delete this unit?')) {
      await deleteMutation.mutateAsync(selectedUnit.id);
    }
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormData({
      property_id: '',
      unit_number: '',
      type: 'studio',
      bedrooms: '',
      bathrooms: '',
      square_meters: '',
      floor: '',
      rent_amount: '',
      deposit_amount: '',
      status: 'vacant',
      description: '',
    });
    setSelectedUnit(null);
  };

  const handleChargeDialogClose = () => {
    setChargeDialogOpen(false);
    setSelectedCharge(null);
    setChargeFormData({
      scope: 'unit',
      property_id: '',
      unit_id: '',
      name: '',
      description: '',
      amount: '',
      billing_type: 'one_time',
      frequency: 'monthly',
      start_date: '',
      end_date: '',
      status: 'active',
    });
  };

  const handleDialogSave = useCallback(async () => {
    const payload: CreateUnitRequest = {
      property_id: formData.property_id,
      unit_number: formData.unit_number.trim(),
      type: formData.type,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      square_meters: formData.square_meters ? Number(formData.square_meters) : undefined,
      floor: formData.floor || undefined,
      rent_amount: Number(formData.rent_amount),
      deposit_amount: formData.deposit_amount ? Number(formData.deposit_amount) : undefined,
      description: formData.description || undefined,
    };

    if (!payload.property_id || !payload.unit_number || !payload.type || !payload.rent_amount) {
      alert('Property, Unit Number, Type and Rent Amount are required.');
      return;
    }

    try {
      if (selectedUnit) {
        await updateMutation.mutateAsync({ id: selectedUnit.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleDialogClose();
    } catch (err: any) {
      const message = err?.response?.data?.message ||
        err?.response?.data?.errors ||
        err?.message ||
        'Failed to save unit.';
      alert(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, [createMutation, formData, selectedUnit, updateMutation]);

  const handleChargeAdd = () => {
    setSelectedCharge(null);
    setChargeDialogOpen(true);
  };

  const handleChargeEdit = (charge: AdditionalCharge) => {
    setSelectedCharge(charge);
    setChargeFormData({
      scope: charge.scope,
      property_id: charge.property_id || '',
      unit_id: charge.unit_id || '',
      name: charge.name,
      description: charge.description || '',
      amount: charge.amount.toString(),
      billing_type: charge.billing_type,
      frequency: charge.frequency || 'monthly',
      start_date: charge.start_date || '',
      end_date: charge.end_date || '',
      status: charge.status,
    });
    setChargeDialogOpen(true);
  };

  const handleChargeDelete = async (charge: AdditionalCharge) => {
    if (confirm('Are you sure you want to delete this charge?')) {
      await deleteChargeMutation.mutateAsync(charge.id);
    }
  };

  const handleChargeSave = useCallback(async () => {
    const payload: CreateAdditionalChargeRequest = {
      scope: chargeFormData.scope,
      property_id: chargeFormData.scope === 'property' ? chargeFormData.property_id : undefined,
      unit_id: chargeFormData.scope === 'unit' ? chargeFormData.unit_id : undefined,
      name: chargeFormData.name.trim(),
      description: chargeFormData.description || undefined,
      amount: Number(chargeFormData.amount),
      billing_type: chargeFormData.billing_type,
      frequency: chargeFormData.billing_type === 'recurring' ? chargeFormData.frequency : undefined,
      start_date: chargeFormData.start_date || undefined,
      end_date: chargeFormData.end_date || undefined,
      status: chargeFormData.status,
    };

    if (!payload.name || !payload.amount) {
      alert('Name and amount are required.');
      return;
    }

    if (payload.scope === 'property' && !payload.property_id) {
      alert('Property is required for apartment-level charges.');
      return;
    }

    if (payload.scope === 'unit' && !payload.unit_id) {
      alert('Unit is required for unit-level charges.');
      return;
    }

    if (payload.billing_type === 'recurring' && !payload.frequency) {
      alert('Frequency is required for recurring charges.');
      return;
    }

    try {
      if (selectedCharge) {
        await updateChargeMutation.mutateAsync({ id: selectedCharge.id, data: payload });
      } else {
        await createChargeMutation.mutateAsync(payload);
      }
      handleChargeDialogClose();
    } catch (err: any) {
      const message = err?.response?.data?.message ||
        err?.response?.data?.errors ||
        err?.message ||
        'Failed to save charge.';
      alert(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, [chargeFormData, createChargeMutation, selectedCharge, updateChargeMutation]);

  const units = unitsData?.data || [];
  const unitOptions = unitOptionsData?.data || [];
  const totalUnits = unitsData?.total || 0;
  const charges = chargesData?.data || [];

  console.log('Units Data:', { unitsData, units, count: units.length });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vacant':
        return 'success';
      case 'occupied':
        return 'info';
      case 'maintenance':
        return 'warning';
      case 'reserved':
        return 'default';
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
          Error loading units: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Unit Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Unit
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Total Units
            </Typography>
            <Typography variant="h4">{stats.total_units}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Vacant
            </Typography>
            <Typography variant="h4">{stats.vacant_units}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Occupied
            </Typography>
            <Typography variant="h4">{stats.occupied_units}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Maintenance
            </Typography>
            <Typography variant="h4">{stats.maintenance_units}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Reserved
            </Typography>
            <Typography variant="h4">{stats.reserved_units}</Typography>
          </Card>
        </Box>
      )}

      {/* Units Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Unit Number</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Bedrooms</TableCell>
                <TableCell>Bathrooms</TableCell>
                <TableCell>Rent Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No units found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                units.map((unit: any) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.unit_number}</TableCell>
                    <TableCell>{unit.property?.name || '-'}</TableCell>
                    <TableCell>{unit.property?.organization?.name || '-'}</TableCell>
                    <TableCell>{unit.type}</TableCell>
                    <TableCell>{unit.bedrooms}</TableCell>
                    <TableCell>{unit.bathrooms}</TableCell>
                    <TableCell>KES {unit.rent_amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={unit.status}
                        color={getStatusColor(unit.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, unit)}>
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
          count={totalUnits}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={15}
          rowsPerPageOptions={[15]}
        />
      </Card>

      {/* Additional Charges */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Other Charges</Typography>
          <Button variant="outlined" onClick={handleChargeAdd}>
            Add Charge
          </Button>
        </Box>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Property / Unit</TableCell>
                  <TableCell>Billing</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chargesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : charges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No additional charges found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  charges.map((charge: AdditionalCharge) => (
                    <TableRow key={charge.id}>
                      <TableCell>{charge.name}</TableCell>
                      <TableCell>{charge.scope === 'property' ? 'Apartment' : 'Unit'}</TableCell>
                      <TableCell>
                        {charge.scope === 'property'
                          ? charge.property?.name || '-'
                          : charge.unit?.unit_number || '-'}
                      </TableCell>
                      <TableCell>
                        {charge.billing_type === 'recurring'
                          ? `Recurring (${charge.frequency})`
                          : 'One-time'}
                      </TableCell>
                      <TableCell>KES {Number(charge.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={charge.status}
                          color={charge.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleChargeEdit(charge)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleChargeDelete(charge)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

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
          {selectedUnit ? 'Edit Unit' : 'Add New Unit'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Property"
              value={formData.property_id}
              onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
              fullWidth
              required
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Unit Number"
              value={formData.unit_number}
              onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CreateUnitRequest['type'] })}
              fullWidth
              required
            >
              <MenuItem value="studio">Studio</MenuItem>
              <MenuItem value="1br">1 Bedroom</MenuItem>
              <MenuItem value="2br">2 Bedroom</MenuItem>
              <MenuItem value="3br">3 Bedroom</MenuItem>
              <MenuItem value="4br">4 Bedroom</MenuItem>
              <MenuItem value="shop">Shop</MenuItem>
              <MenuItem value="office">Office</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              label="Bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              fullWidth
            />
            <TextField
              label="Bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              fullWidth
            />
            <TextField
              label="Square Meters"
              type="number"
              value={formData.square_meters}
              onChange={(e) => setFormData({ ...formData, square_meters: e.target.value })}
              fullWidth
            />
            <TextField
              label="Floor"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              fullWidth
            />
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
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Unit['status'] })}
              fullWidth
            >
              <MenuItem value="vacant">Vacant</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="reserved">Reserved</MenuItem>
            </TextField>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained">
            {selectedUnit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Charge Dialog */}
      <Dialog open={chargeDialogOpen} onClose={handleChargeDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCharge ? 'Edit Charge' : 'Add Charge'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Scope"
              value={chargeFormData.scope}
              onChange={(e) =>
                setChargeFormData({
                  ...chargeFormData,
                  scope: e.target.value as ChargeScope,
                  unit_id: '',
                  property_id: '',
                })
              }
              fullWidth
            >
              <MenuItem value="unit">Per Unit</MenuItem>
              <MenuItem value="property">Per Apartment (All Units)</MenuItem>
            </TextField>

            {chargeFormData.scope === 'property' && (
              <TextField
                select
                label="Property"
                value={chargeFormData.property_id}
                onChange={(e) => setChargeFormData({ ...chargeFormData, property_id: e.target.value })}
                fullWidth
              >
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {chargeFormData.scope === 'unit' && (
              <TextField
                select
                label="Unit"
                value={chargeFormData.unit_id}
                onChange={(e) => setChargeFormData({ ...chargeFormData, unit_id: e.target.value })}
                fullWidth
              >
                {unitOptions.map((unit: any) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.unit_number} {unit.property?.name ? `(${unit.property?.name})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Charge Name"
              value={chargeFormData.name}
              onChange={(e) => setChargeFormData({ ...chargeFormData, name: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Amount"
              type="number"
              value={chargeFormData.amount}
              onChange={(e) => setChargeFormData({ ...chargeFormData, amount: e.target.value })}
              fullWidth
              required
            />

            <TextField
              select
              label="Billing Type"
              value={chargeFormData.billing_type}
              onChange={(e) =>
                setChargeFormData({
                  ...chargeFormData,
                  billing_type: e.target.value as ChargeBillingType,
                })
              }
              fullWidth
            >
              <MenuItem value="one_time">One-time</MenuItem>
              <MenuItem value="recurring">Recurring</MenuItem>
            </TextField>

            {chargeFormData.billing_type === 'recurring' && (
              <TextField
                select
                label="Frequency"
                value={chargeFormData.frequency}
                onChange={(e) =>
                  setChargeFormData({
                    ...chargeFormData,
                    frequency: e.target.value as ChargeFrequency,
                  })
                }
                fullWidth
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </TextField>
            )}

            <TextField
              label="Start Date"
              type="date"
              value={chargeFormData.start_date}
              onChange={(e) => setChargeFormData({ ...chargeFormData, start_date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Date"
              type="date"
              value={chargeFormData.end_date}
              onChange={(e) => setChargeFormData({ ...chargeFormData, end_date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Status"
              value={chargeFormData.status}
              onChange={(e) =>
                setChargeFormData({
                  ...chargeFormData,
                  status: e.target.value as ChargeStatus,
                })
              }
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            <TextField
              label="Description"
              value={chargeFormData.description}
              onChange={(e) => setChargeFormData({ ...chargeFormData, description: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChargeDialogClose}>Cancel</Button>
          <Button onClick={handleChargeSave} variant="contained">
            {selectedCharge ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

