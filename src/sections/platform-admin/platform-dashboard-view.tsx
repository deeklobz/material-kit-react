import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import analyticsService from 'src/services/analyticsService';
import subscriptionManagementService from 'src/services/subscriptionManagementService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PlatformDashboardView() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: analyticsService.getAnalytics,
  });

  const { data: subscriptionStats, isLoading: statsLoading } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: subscriptionManagementService.getStats,
  });

  const isLoading = analyticsLoading || statsLoading;

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const overviewStats = [
    {
      title: 'Total Organizations',
      value: analytics?.overview.total_organizations || 0,
      subtitle: `${analytics?.overview.active_organizations || 0} active`,
      icon: 'solar:buildings-2-bold-duotone',
      color: theme.palette.primary.main,
      trend: '+12%',
    },
    {
      title: 'Active Subscriptions',
      value: subscriptionStats?.active_subscriptions || 0,
      subtitle: `${subscriptionStats?.trial_subscriptions || 0} on trial`,
      icon: 'solar:card-bold-duotone',
      color: theme.palette.success.main,
      trend: '+8%',
    },
    {
      title: 'Monthly Revenue',
      value: `KES ${(analytics?.revenue.monthly_revenue || 0).toLocaleString()}`,
      subtitle: `${analytics?.revenue.revenue_growth?.toFixed(1) || 0}% growth`,
      icon: 'solar:dollar-minimalistic-bold-duotone',
      color: theme.palette.warning.main,
      trend: `${(analytics?.revenue.revenue_growth ?? 0) > 0 ? '+' : ''}${(analytics?.revenue.revenue_growth ?? 0).toFixed(1)}%`,
    },
    {
      title: 'Platform Properties',
      value: analytics?.overview.total_properties || 0,
      subtitle: `${analytics?.overview.total_units || 0} units total`,
      icon: 'solar:home-2-bold-duotone',
      color: theme.palette.info.main,
      trend: '+15%',
    },
  ];

  const systemHealth = [
    {
      label: 'Conversion Rate',
      value: subscriptionStats?.conversion_rate || 0,
      target: 25,
      color: 'success',
      unit: '%',
    },
    {
      label: 'Occupancy Rate',
      value: analytics?.overview.occupancy_rate || 0,
      target: 85,
      color: 'info',
      unit: '%',
    },
    {
      label: 'Active Users',
      value: analytics?.overview.total_users || 0,
      target: 500,
      color: 'primary',
      unit: '',
    },
  ];

  const quickActions = [
    {
      title: 'Organizations',
      description: 'Manage all property managers',
      icon: 'solar:buildings-2-bold-duotone',
      path: '/organizations',
      color: theme.palette.primary.main,
    },
    {
      title: 'Subscription Plans',
      description: 'Configure pricing & features',
      icon: 'solar:bag-4-bold-duotone',
      path: '/subscription-plans',
      color: theme.palette.success.main,
    },
    {
      title: 'Active Subscriptions',
      description: 'Monitor billing & renewals',
      icon: 'solar:card-recive-bold-duotone',
      path: '/active-subscriptions',
      color: theme.palette.warning.main,
    },
    {
      title: 'Platform Analytics',
      description: 'Revenue & growth insights',
      icon: 'solar:chart-bold-duotone',
      path: '/platform-analytics',
      color: theme.palette.info.main,
    },
  ];

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Platform Command Center</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Monitor and manage all organizations, subscriptions, and platform operations
        </Typography>
      </Box>

      {/* Overview Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {overviewStats.map((stat) => (
          <Box key={stat.title} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(stat.color, 0.1),
                  }}
                >
                  <Iconify icon={stat.icon as any} sx={{ color: stat.color, width: 28, height: 28 }} />
                </Box>
                <Chip
                  label={stat.trend}
                  size="small"
                  color={stat.trend.startsWith('+') ? 'success' : 'error'}
                  sx={{ height: 24 }}
                />
              </Box>
              <Typography variant="h3" sx={{ mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {stat.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {stat.subtitle}
              </Typography>
            </Card>
          </Box>
        ))}
      </Box>

      {/* System Health & Metrics */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Platform Health Metrics
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {systemHealth.map((metric) => (
            <Box key={metric.label} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metric.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metric.value}{metric.unit} / {metric.target}{metric.unit}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(metric.value / metric.target) * 100}
                color={metric.color as any}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          ))}
        </Box>
      </Card>

      {/* Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {quickActions.map((action) => (
            <Box key={action.title} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
              <Card
                sx={{
                  p: 2.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(action.color, 0.1),
                    }}
                  >
                    <Iconify icon={action.icon as any} sx={{ color: action.color, width: 24, height: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.25 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Top Organizations & Recent Activity */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Top Organizations */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(60% - 12px)' } }}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Top Organizations by Revenue</Typography>
              <Button size="small" onClick={() => navigate('/organizations')}>
                View All
              </Button>
            </Box>
            <Box sx={{ p: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell align="right">Properties</TableCell>
                    <TableCell align="right">Units</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics?.top_organizations.slice(0, 5).map((org) => (
                    <TableRow key={org.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{org.name}</Typography>
                      </TableCell>
                      <TableCell align="right">{org.properties_count}</TableCell>
                      <TableCell align="right">{org.units_count}</TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
                          KES {org.revenue.toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Box>

        {/* Plan Distribution */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(40% - 12px)' } }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Subscription Plan Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analytics?.plan_distribution.slice(0, 4).map((plan) => (
                <Box key={plan.plan_code}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {plan.plan_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {plan.count} ({plan.percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={plan.percentage}
                    sx={{ height: 8, borderRadius: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                    Revenue: KES {plan.revenue.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      </Box>
    </>
  );
}
