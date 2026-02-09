import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import analyticsService from 'src/services/analyticsService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PlatformAnalyticsView() {
  const [exporting, setExporting] = useState(false);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: analyticsService.getAnalytics,
  });

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    setExporting(true);
    try {
      const blob = await analyticsService.exportReport(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform-analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setExporting(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return <Typography>No analytics data available</Typography>;
  }

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Platform Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon={"eva:download-outline" as any} />}
            onClick={() => handleExport('excel')}
            disabled={exporting}
          >
            Export Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon={"eva:file-text-outline" as any} />}
            onClick={() => handleExport('pdf')}
            disabled={exporting}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Overview Stats */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Platform Overview
      </Typography>
      <Box sx={{ mb: 4, display: 'grid', gap: 3, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard
          title="Total Organizations"
          value={analytics.overview.total_organizations}
          subtitle={`${analytics.overview.active_organizations} active`}
          color="primary"
          icon="eva:briefcase-fill"
        />
        <StatCard
          title="Total Properties"
          value={analytics.overview.total_properties}
          subtitle={`${analytics.overview.total_units} units`}
          color="success"
          icon="eva:home-fill"
        />
        <StatCard
          title="Total Tenants"
          value={analytics.overview.total_tenants}
          subtitle={`${analytics.overview.occupancy_rate.toFixed(1)}% occupancy`}
          color="info"
          icon="eva:people-fill"
        />
        <StatCard
          title="Total Users"
          value={analytics.overview.total_users}
          subtitle="Platform users"
          color="warning"
          icon="eva:person-fill"
        />
      </Box>

      {/* Revenue Stats */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Revenue Metrics
      </Typography>
      <Box sx={{ mb: 4, display: 'grid', gap: 3, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard
          title="Total Revenue"
          value={`KES ${analytics.revenue.total_revenue.toLocaleString()}`}
          subtitle={`${analytics.revenue.revenue_growth.toFixed(1)}% growth`}
          color="success"
          icon="eva:credit-card-fill"
        />
        <StatCard
          title="Monthly Revenue"
          value={`KES ${analytics.revenue.monthly_revenue.toLocaleString()}`}
          subtitle="This month"
          color="primary"
          icon="eva:trending-up-fill"
        />
        <StatCard
          title="Yearly Revenue"
          value={`KES ${analytics.revenue.yearly_revenue.toLocaleString()}`}
          subtitle="This year"
          color="info"
          icon="eva:bar-chart-fill"
        />
        <StatCard
          title="Avg per Organization"
          value={`KES ${analytics.revenue.average_revenue_per_org.toLocaleString()}`}
          subtitle="Monthly average"
          color="warning"
          icon="eva:pie-chart-fill"
        />
      </Box>

      {/* Subscription Stats */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Subscription Metrics
      </Typography>
      <Box sx={{ mb: 4, display: 'grid', gap: 3, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard
          title="Total Subscriptions"
          value={analytics.subscriptions.total_subscriptions}
          subtitle="All time"
          color="primary"
          icon="eva:award-fill"
        />
        <StatCard
          title="Active"
          value={analytics.subscriptions.active_subscriptions}
          subtitle="Currently active"
          color="success"
          icon="eva:checkmark-circle-2-fill"
        />
        <StatCard
          title="On Trial"
          value={analytics.subscriptions.trial_subscriptions}
          subtitle="Trial period"
          color="info"
          icon="eva:clock-fill"
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.subscriptions.conversion_rate.toFixed(1)}%`}
          subtitle={`${analytics.subscriptions.churn_rate.toFixed(1)}% churn`}
          color="warning"
          icon="eva:trending-up-fill"
        />
      </Box>

      {/* Plan Distribution */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Plan Distribution
      </Typography>
      <Box sx={{ mb: 4, display: 'grid', gap: 3, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {analytics.plan_distribution.map((plan: any) => (
          <Card key={plan.plan_code} sx={{ p: 3 }}>
            <Typography variant="h6">{plan.plan_name}</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>
              {plan.count}
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {plan.percentage.toFixed(1)}% of total
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={plan.percentage}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Revenue: KES {plan.revenue.toLocaleString()}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* Top Organizations */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Top Organizations
      </Typography>
      <Card>
        <Box sx={{ p: 3 }}>
          {analytics.top_organizations.map((org: any, index: number) => (
            <Box
              key={org.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
                borderBottom: index < analytics.top_organizations.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" color="text.secondary">
                  #{index + 1}
                </Typography>
                <Box>
                  <Typography variant="subtitle1">{org.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {org.properties_count} properties • {org.units_count} units
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" color="success.main">
                KES {org.revenue.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'error';
  icon?: string;
};

function StatCard({ title, value, subtitle, color = 'primary', icon }: StatCardProps) {
  return (
    <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}.lighter`,
        }}
      >
        {icon && <Iconify icon={icon as any} width={32} sx={{ color: `${color}.main` }} />}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
