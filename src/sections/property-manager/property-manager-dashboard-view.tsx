import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PropertyManagerDashboardView() {
  const theme = useTheme();

  const stats = [
    {
      title: 'Total Properties',
      value: '0',
      icon: 'mdi:office-building',
      color: theme.palette.primary.main,
    },
    {
      title: 'Total Units',
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

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4">Property Manager Dashboard</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Overview of your properties, tenants, and rental income
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {stats.map((stat) => (
          <Box key={stat.title} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
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

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(25% - 12px)' } }}>
            <Card sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Iconify icon={'mdi:office-building-plus' as any} sx={{ width: 32, height: 32 }} />
                <Box>
                  <Typography variant="subtitle1">Add Property</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Register new property
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(25% - 12px)' } }}>
            <Card sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Iconify icon={'mdi:account-plus' as any} sx={{ width: 32, height: 32 }} />
                <Box>
                  <Typography variant="subtitle1">Add Tenant</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Register new tenant
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(25% - 12px)' } }}>
            <Card sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Iconify icon={'mdi:file-document' as any} sx={{ width: 32, height: 32 }} />
                <Box>
                  <Typography variant="subtitle1">Create Invoice</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Generate rent invoice
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(25% - 12px)' } }}>
            <Card sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Iconify icon={'mdi:chart-bar' as any} sx={{ width: 32, height: 32 }} />
                <Box>
                  <Typography variant="subtitle1">View Reports</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Analytics & insights
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  );
}
