import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

// -----------------------------------------------------------------------

export function OrganizationDashboardView() {
  const theme = useTheme();
  const [trialDaysRemaining] = useState(11); // Should come from API

  const stats = [
    {
      title: 'Properties',
      value: '0',
      icon: 'mdi:office-building',
      color: theme.palette.primary.main,
    },
    {
      title: 'Units',
      value: '0',
      icon: 'mdi:door',
      color: theme.palette.info.main,
    },
    {
      title: 'Active Tenants',
      value: '0',
      icon: 'mdi:account-group',
      color: theme.palette.success.main,
    },
    {
      title: 'Monthly Rent',
      value: 'KSh 0',
      icon: 'mdi:currency-usd',
      color: theme.palette.warning.main,
    },
  ];

  const recentActivities = [
    { action: 'Property added', time: '2 hours ago', icon: 'mdi:office-building-plus' },
    { action: 'Tenant onboarded', time: '5 hours ago', icon: 'mdi:account-plus' },
    { action: 'Rent payment received', time: '1 day ago', icon: 'mdi:cash' },
  ];

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Organization Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Welcome back! Here&apos;s your organization overview.
        </Typography>
      </Box>

      {/* Trial Status Card */}
      {trialDaysRemaining > 0 && (
        <Card sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.warning.main, 0.08) }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Free Trial Active
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {trialDaysRemaining} days remaining in your free trial
              </Typography>
              <Box sx={{ width: 300 }}>
                <LinearProgress
                  variant="determinate"
                  value={(trialDaysRemaining / 14) * 100}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>
            </Box>
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                // Navigate to billing page
              }}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Upgrade Now
            </Button>
          </Stack>
        </Card>
      )}

      {/* Stats Cards */}
      <Stack spacing={3} sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {stats.map((stat) => (
            <Box
              key={stat.title}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}
            >
              <Card sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(stat.color, 0.1),
                    }}
                  >
                    <Iconify icon={stat.icon as any} sx={{ color: stat.color, width: 32, height: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      </Stack>

      {/* Quick Actions & Recent Activity */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Quick Actions */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => {
                // Navigate to add property
              }}
            >
              Add Property
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => {
                // Navigate to add tenant
              }}
            >
              Add Tenant
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => {
                // Navigate to invite staff
              }}
            >
              Invite Staff
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => {
                // Navigate to settings
              }}
            >
              Organization Settings
            </Button>
          </Stack>
        </Card>

        {/* Recent Activities */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Stack spacing={2}>
            {recentActivities.map((activity, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  pb: 2,
                  borderBottom: index < recentActivities.length - 1 ? `1px solid ${theme.vars.palette.divider}` : 'none',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Iconify icon={activity.icon as any} sx={{ width: 20, height: 20 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {activity.action}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>
      </Box>
    </>
  );
}
