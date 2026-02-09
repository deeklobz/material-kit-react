import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Tab,
  Card,
  Tabs,
  Alert,
  Stack,
  Button,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import settingsService from '../../services/settingsService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SystemSettingsView() {
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSuccessMessage('Settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const maintenanceModeMutation = useMutation({
    mutationFn: settingsService.toggleMaintenanceMode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSuccessMessage('Maintenance mode updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlatformSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string,
      timezone: formData.get('timezone') as string,
      locale: formData.get('locale') as string,
    };
    updateMutation.mutate({ section: 'platform', settings: data });
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      driver: formData.get('driver') as string,
      host: formData.get('host') as string,
      port: parseInt(formData.get('port') as string, 10),
      encryption: formData.get('encryption') as string,
      from_address: formData.get('from_address') as string,
      from_name: formData.get('from_name') as string,
    };
    updateMutation.mutate({ section: 'email', settings: data });
  };

  const handlePaymentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      mpesa_enabled: formData.get('mpesa_enabled') === 'on',
      mpesa_environment: formData.get('mpesa_environment') as string,
      mpesa_shortcode: formData.get('mpesa_shortcode') as string,
    };
    updateMutation.mutate({ section: 'payment', settings: data });
  };

  const handleNotificationsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      email_notifications: formData.get('email_notifications') === 'on',
      sms_notifications: formData.get('sms_notifications') === 'on',
      push_notifications: formData.get('push_notifications') === 'on',
    };
    updateMutation.mutate({ section: 'notifications', settings: data });
  };

  const handleMaintenanceModeToggle = (enabled: boolean) => {
    maintenanceModeMutation.mutate(enabled);
  };

  if (isLoading || !settings) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        System Settings
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Platform" />
          <Tab label="Email" />
          <Tab label="Payment" />
          <Tab label="Notifications" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handlePlatformSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Platform Name"
                name="name"
                defaultValue={settings.platform.name}
                required
              />
              <TextField
                fullWidth
                label="Contact Email"
                name="contact_email"
                type="email"
                defaultValue={settings.platform.contact_email}
                required
              />
              <TextField
                fullWidth
                label="Contact Phone"
                name="contact_phone"
                defaultValue={settings.platform.contact_phone}
              />
              <TextField
                fullWidth
                label="Timezone"
                name="timezone"
                select
                defaultValue={settings.platform.timezone}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="Africa/Nairobi">Africa/Nairobi</MenuItem>
                <MenuItem value="America/New_York">America/New York</MenuItem>
                <MenuItem value="Europe/London">Europe/London</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Locale"
                name="locale"
                select
                defaultValue={settings.platform.locale}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="sw">Swahili</MenuItem>
              </TextField>

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.platform.maintenance_mode}
                    onChange={(e) => handleMaintenanceModeToggle(e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />
              <Typography variant="caption" color="text.secondary">
                When enabled, only administrators can access the platform
              </Typography>

              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Save Platform Settings
              </Button>
            </Stack>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleEmailSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Mail Driver"
                name="driver"
                select
                defaultValue={settings.email.driver}
              >
                <MenuItem value="smtp">SMTP</MenuItem>
                <MenuItem value="sendmail">Sendmail</MenuItem>
                <MenuItem value="mailgun">Mailgun</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="SMTP Host"
                name="host"
                defaultValue={settings.email.host}
                required
              />
              <TextField
                fullWidth
                label="SMTP Port"
                name="port"
                type="number"
                defaultValue={settings.email.port}
                required
              />
              <TextField
                fullWidth
                label="Encryption"
                name="encryption"
                select
                defaultValue={settings.email.encryption}
              >
                <MenuItem value="tls">TLS</MenuItem>
                <MenuItem value="ssl">SSL</MenuItem>
                <MenuItem value="">None</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="From Address"
                name="from_address"
                type="email"
                defaultValue={settings.email.from_address}
                required
              />
              <TextField
                fullWidth
                label="From Name"
                name="from_name"
                defaultValue={settings.email.from_name}
                required
              />

              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Save Email Settings
              </Button>
            </Stack>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box component="form" onSubmit={handlePaymentSubmit}>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch name="mpesa_enabled" defaultChecked={settings.payment.mpesa_enabled} />
                }
                label="Enable M-Pesa Payments"
              />

              <TextField
                fullWidth
                label="M-Pesa Environment"
                name="mpesa_environment"
                select
                defaultValue={settings.payment.mpesa_environment}
              >
                <MenuItem value="sandbox">Sandbox</MenuItem>
                <MenuItem value="production">Production</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="M-Pesa Shortcode"
                name="mpesa_shortcode"
                defaultValue={settings.payment.mpesa_shortcode}
              />
              <Alert severity="info">
                Consumer Key and Passkey are hidden for security. To update them, modify the .env file.
              </Alert>

              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Save Payment Settings
              </Button>
            </Stack>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box component="form" onSubmit={handleNotificationsSubmit}>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    name="email_notifications"
                    defaultChecked={settings.notifications.email_notifications}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="sms_notifications"
                    defaultChecked={settings.notifications.sms_notifications}
                  />
                }
                label="SMS Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="push_notifications"
                    defaultChecked={settings.notifications.push_notifications}
                  />
                }
                label="Push Notifications"
              />

              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Save Notification Settings
              </Button>
            </Stack>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
}
