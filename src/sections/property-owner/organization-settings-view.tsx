import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// -----------------------------------------------------------------------

export function OrganizationSettingsView() {
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: 'Acme Properties Ltd',
    email: 'info@acmeproperties.com',
    phone: '+254 123 456 789',
    address: '123 Business Street, Nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    registrationNumber: 'CPR/2024/12345',
    taxId: 'P051234567A',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Call API to save organization settings
      console.log('Saving organization settings:', formData);
      // await organizationService.updateOrganization(formData);
    } catch (error) {
      console.error('Error saving organization settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Organization Settings
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage your organization profile and settings
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Organization Logo */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Organization Logo
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: 32,
                  bgcolor: 'primary.main',
                }}
                src={logoPreview || undefined}
              >
                {formData.name.charAt(0)}
              </Avatar>
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                >
                  Upload Logo
                  <input hidden accept="image/*" type="file" onChange={handleLogoUpload} />
                </Button>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  Recommended size: 200x200px, Max size: 2MB
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Card>

        {/* Organization Details */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Organization Details
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Organization Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter organization name"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="info@example.com"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 123 456 789"
            />
          </Stack>
        </Card>

        {/* Address Details */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Address Details
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter street address"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </Box>
          </Stack>
        </Card>

        {/* Legal Details */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Legal Details
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Company Registration Number"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="Enter registration number"
            />
            <TextField
              fullWidth
              label="Tax ID / PIN"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              placeholder="Enter tax ID"
            />
          </Stack>
        </Card>

        <Divider />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Stack>
    </>
  );
}
