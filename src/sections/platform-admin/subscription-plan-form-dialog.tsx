import type { FormEvent } from 'react';
import type { SubscriptionPlan, SubscriptionPlanFormData } from 'src/services/subscriptionService';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

type SubscriptionPlanFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionPlanFormData) => Promise<void>;
  plan?: SubscriptionPlan | null;
  loading?: boolean;
};

const COMMON_FEATURES = [
  'Property Management',
  'Unit Management',
  'Tenant Management',
  'Lease Management',
  'Rent Collection',
  'Invoice Generation',
  'Payment Tracking',
  'Receipt Generation',
  'M-Pesa Integration',
  'Bank Transfer Support',
  'SMS Notifications',
  'WhatsApp Notifications',
  'Email Notifications',
  'Maintenance/Work Orders',
  'Vendor Management',
  'Asset Management',
  'Document Management',
  'Prospect Management',
  'Listing Management',
  'Vacancy Tracking',
  'Reports & Analytics',
  'Financial Reports',
  'Occupancy Reports',
  'Rent Roll Reports',
  'Multi-user Access',
  'Role-based Permissions',
  'Activity Logs',
  'Priority Support',
  'Custom Branding',
  'White-label Option',
  'API Access',
  'Advanced Reporting',
  'Data Export',
  'Mobile App Access',
];

export function SubscriptionPlanFormDialog({
  open,
  onClose,
  onSubmit,
  plan,
  loading = false,
}: SubscriptionPlanFormDialogProps) {
  const [formData, setFormData] = useState<SubscriptionPlanFormData>({
    name: plan?.name || '',
    code: plan?.code || '',
    description: plan?.description || '',
    price: plan?.price || 0,
    billing_cycle: plan?.billing_cycle || 'monthly',
    trial_days: plan?.trial_days || 14,
    max_properties: plan?.max_properties,
    max_units: plan?.max_units,
    max_users: plan?.max_users,
    features: plan?.features || [],
    is_active: plan?.is_active ?? true,
  });

  // Update form data when plan prop changes
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        code: plan.code || '',
        description: plan.description || '',
        price: plan.price || 0,
        billing_cycle: plan.billing_cycle || 'monthly',
        trial_days: plan.trial_days || 14,
        max_properties: plan.max_properties,
        max_units: plan.max_units,
        max_users: plan.max_users,
        features: plan.features || [],
        is_active: plan.is_active ?? true,
      });
    } else {
      // Reset form when creating new
      setFormData({
        name: '',
        code: '',
        description: '',
        price: 0,
        billing_cycle: 'monthly',
        trial_days: 14,
        max_properties: undefined,
        max_units: undefined,
        max_users: undefined,
        features: [],
        is_active: true,
      });
    }
  }, [plan]);

  const handleChange = useCallback((field: keyof SubscriptionPlanFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{plan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                required
                label="Plan Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Starter, Growth, Professional"
              />
              <TextField
                fullWidth
                required
                label="Plan Code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g., starter, growth"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Price (KSh)"
                value={formData.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
              />
              <FormControl fullWidth required>
                <InputLabel>Billing Cycle</InputLabel>
                <Select
                  value={formData.billing_cycle}
                  label="Billing Cycle"
                  onChange={(e) => handleChange('billing_cycle', e.target.value)}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              required
              type="number"
              label="Trial Days"
              value={formData.trial_days}
              onChange={(e) => handleChange('trial_days', Number(e.target.value))}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Properties"
                value={formData.max_properties || ''}
                onChange={(e) => handleChange('max_properties', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Leave empty for unlimited"
              />
              <TextField
                fullWidth
                type="number"
                label="Max Units"
                value={formData.max_units || ''}
                onChange={(e) => handleChange('max_units', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Leave empty for unlimited"
              />
              <TextField
                fullWidth
                type="number"
                label="Max Users"
                value={formData.max_users || ''}
                onChange={(e) => handleChange('max_users', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Leave empty for unlimited"
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Features</InputLabel>
              <Select
                multiple
                value={formData.features}
                onChange={(e) => handleChange('features', e.target.value)}
                input={<OutlinedInput label="Features" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {COMMON_FEATURES.map((feature) => (
                  <MenuItem key={feature} value={feature}>
                    {feature}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : plan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
