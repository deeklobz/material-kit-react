import type { FormEvent } from 'react';
import type { Property, PropertyFormData } from 'src/services/propertyService';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

type PropertyFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  property?: Property | null;
};

export function PropertyFormDialog({ open, onClose, onSubmit, property }: PropertyFormDialogProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: property?.name || '',
    code: property?.code || '',
    type: property?.type || 'residential',
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    postal_code: property?.postal_code || '',
    country: property?.country || 'Kenya',
    total_units: property?.total_units || 0,
    status: property?.status || 'active',
    description: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof PropertyFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    },
    [formData, onSubmit, onClose]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>

      <DialogContent>
        <Box component="form" id="property-form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Property Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
            <TextField
              fullWidth
              label="Property Code"
              value={formData.code}
              onChange={handleChange('code')}
              required
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={handleChange('type')}
              required
            >
              <MenuItem value="residential">Residential</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
              <MenuItem value="mixed">Mixed Use</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Total Units"
              type="number"
              value={formData.total_units}
              onChange={handleChange('total_units')}
              required
            />
          </Box>

          <TextField
            fullWidth
            label="Address"
            value={formData.address}
            onChange={handleChange('address')}
            required
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleChange('city')}
              required
            />
            <TextField
              fullWidth
              label="State/County"
              value={formData.state}
              onChange={handleChange('state')}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Postal Code"
              value={formData.postal_code}
              onChange={handleChange('postal_code')}
            />
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={handleChange('country')}
            />
          </Box>

          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={handleChange('status')}
            required
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="property-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : property ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
