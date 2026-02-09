import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

import reportService from 'src/services/reportService';
import { propertyService } from 'src/services/propertyService';

// ----------------------------------------------------------------------

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function ReportsView() {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  const [dateRange, setDateRange] = useState({
    start_date: `${year}-01-01`,
    end_date: `${year}-${month}-${day}`,
  });

  // Fetch properties for filter
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.getAll(),
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-KE');

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Reports & Analytics</Typography>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
          <Box>
            <TextField
              fullWidth
              select
              label="Property"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
              <MenuItem value="">All Properties</MenuItem>
              {properties?.map((property: any) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ px: 2, pt: 2 }}>
          <Tab label="Owner Statements" />
          <Tab label="Rent Roll" />
          <Tab label="Profitability" />
          <Tab label="Arrears Aging" />
          <Tab label="Occupancy Trends" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <OwnerStatementTab
            propertyId={selectedProperty}
            startDate={dateRange.start_date}
            endDate={dateRange.end_date}
            formatCurrency={formatCurrency}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <RentRollTab
            propertyId={selectedProperty}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <ProfitabilityTab
            propertyId={selectedProperty}
            startDate={dateRange.start_date}
            endDate={dateRange.end_date}
            formatCurrency={formatCurrency}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <ArrearsAgingTab propertyId={selectedProperty} formatCurrency={formatCurrency} />
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <OccupancyTrendTab
            propertyId={selectedProperty}
            startDate={dateRange.start_date}
            endDate={dateRange.end_date}
          />
        </TabPanel>
      </Card>
    </DashboardContent>
  );
}

// Owner Statement Tab Component
function OwnerStatementTab({
  propertyId,
  startDate,
  endDate,
  formatCurrency,
}: {
  propertyId: string;
  startDate: string;
  endDate: string;
  formatCurrency: (amount: number) => string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ownerStatement', propertyId, startDate, endDate],
    queryFn: () =>
      reportService.getOwnerStatement({
        property_id: propertyId || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load owner statement
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
        <Box>
          <Card sx={{ p: 2, bgcolor: 'success.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              Total Income
            </Typography>
            <Typography variant="h4">{formatCurrency(data?.summary.total_income || 0)}</Typography>
          </Card>
        </Box>
        <Box>
          <Card sx={{ p: 2, bgcolor: 'error.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              Total Expenses
            </Typography>
            <Typography variant="h4">
              {formatCurrency(data?.summary.total_expenses || 0)}
            </Typography>
          </Card>
        </Box>
        <Box>
          <Card sx={{ p: 2, bgcolor: 'info.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              Net Income
            </Typography>
            <Typography variant="h4">{formatCurrency(data?.summary.net_income || 0)}</Typography>
          </Card>
        </Box>
      </Box>

      {/* Property Statements */}
      {data?.statements.map((statement: any) => (
        <Card key={statement.property.id} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {statement.property.name}
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Income by Payment Method
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Method</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statement.income.by_method.map((method: any) => (
                      <TableRow key={method.payment_method}>
                        <TableCell>
                          <Chip label={method.payment_method.toUpperCase()} size="small" />
                        </TableCell>
                        <TableCell align="right">{method.transaction_count}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(method.total_received)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <strong>Total</strong>
                      </TableCell>
                      <TableCell />
                      <TableCell align="right">
                        <strong>{formatCurrency(statement.income.total)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Expenses by Category
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Work Orders</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statement.expenses.by_category.map((category: any) => (
                      <TableRow key={category.category}>
                        <TableCell>{category.category}</TableCell>
                        <TableCell align="right">{category.work_order_count}</TableCell>
                        <TableCell align="right">{formatCurrency(category.total_cost)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <strong>Total</strong>
                      </TableCell>
                      <TableCell />
                      <TableCell align="right">
                        <strong>{formatCurrency(statement.expenses.total)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Net Income
                </Typography>
                <Typography variant="h6">{formatCurrency(statement.net_income)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Collection Rate
                </Typography>
                <Typography variant="h6">{statement.invoicing.collection_rate.toFixed(1)}%</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Occupancy Rate
                </Typography>
                <Typography variant="h6">{statement.occupancy.occupancy_rate.toFixed(1)}%</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Occupied Units
                </Typography>
                <Typography variant="h6">
                  {statement.occupancy.occupied_units}/{statement.occupancy.total_units}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}

// Rent Roll Tab Component
function RentRollTab({
  propertyId,
  formatCurrency,
  formatDate,
}: {
  propertyId: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rentRoll', propertyId],
    queryFn: () =>
      reportService.getRentRoll({
        property_id: propertyId || undefined,
      }),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load rent roll
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'success';
      case 'outstanding':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Summary */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
        <Box>
          <Card sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Tenants
            </Typography>
            <Typography variant="h4">{data?.summary.total_tenants}</Typography>
          </Card>
        </Box>
        <Box>
          <Card sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Monthly Rent
            </Typography>
            <Typography variant="h4">
              {formatCurrency(data?.summary.total_monthly_rent || 0)}
            </Typography>
          </Card>
        </Box>
        <Box>
          <Card sx={{ p: 2, bgcolor: 'warning.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              Outstanding
            </Typography>
            <Typography variant="h4">
              {formatCurrency(data?.summary.total_outstanding || 0)}
            </Typography>
          </Card>
        </Box>
        <Box>
          <Card sx={{ p: 2, bgcolor: 'error.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              Overdue Tenants
            </Typography>
            <Typography variant="h4">{data?.summary.overdue_count}</Typography>
          </Card>
        </Box>
      </Box>

      {/* Rent Roll Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Rent</TableCell>
                <TableCell align="right">Outstanding</TableCell>
                <TableCell align="center">Days Overdue</TableCell>
                <TableCell>Last Payment</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.rent_roll.map((entry: any) => (
                <TableRow key={entry.lease.id}>
                  <TableCell>
                    <Typography variant="body2">{entry.tenant.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.tenant.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>{entry.property.name}</TableCell>
                  <TableCell>{entry.unit.unit_number}</TableCell>
                  <TableCell align="right">{formatCurrency(entry.lease.rent_amount)}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(entry.payment_status.outstanding_balance)}
                  </TableCell>
                  <TableCell align="center">
                    {entry.payment_status.days_overdue > 0 && (
                      <Chip
                        label={entry.payment_status.days_overdue}
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.payment_status.last_payment_date ? (
                      <>
                        <Typography variant="body2">
                          {formatDate(entry.payment_status.last_payment_date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(entry.payment_status.last_payment_amount)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No payments
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={entry.payment_status.status}
                      color={getStatusColor(entry.payment_status.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}

// Profitability Tab Component
function ProfitabilityTab({
  propertyId,
  startDate,
  endDate,
  formatCurrency,
}: {
  propertyId: string;
  startDate: string;
  endDate: string;
  formatCurrency: (amount: number) => string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profitability', propertyId, startDate, endDate],
    queryFn: () =>
      reportService.getProfitability({
        property_id: propertyId || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load profitability report
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Summary */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
        <Box>
          <Card sx={{ p: 2, bgcolor: 'success.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h4">
              {formatCurrency(data?.summary.total_revenue || 0)}
            </Typography>
          </Card>
        </Box>
        <Box>
          <Card sx={{ p: 2, bgcolor: 'error.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              Total Expenses
            </Typography>
            <Typography variant="h4">
              {formatCurrency(data?.summary.total_expenses || 0)}
            </Typography>
          </Card>
        </Box>
        <Box>
          <Card sx={{ p: 2, bgcolor: 'info.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              Net Profit
            </Typography>
            <Typography variant="h4">
              {formatCurrency(data?.summary.total_profit || 0)}
            </Typography>
          </Card>
        </Box>
      </Box>

      {/* Property Profitability */}
      {data?.profitability.map((property: any) => (
        <Card key={property.property.id} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {property.property.name}
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Revenue
              </Typography>
              <Typography variant="h6">{formatCurrency(property.revenue)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Expenses
              </Typography>
              <Typography variant="h6">{formatCurrency(property.expenses)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Profit
              </Typography>
              <Typography variant="h6">{formatCurrency(property.profit)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Profit Margin
              </Typography>
              <Typography variant="h6">{property.profit_margin}%</Typography>
            </Box>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Monthly Breakdown
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Expenses</TableCell>
                  <TableCell align="right">Profit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {property.monthly_breakdown.map((month: any) => (
                  <TableRow key={month.month}>
                    <TableCell>{month.month}</TableCell>
                    <TableCell align="right">{formatCurrency(month.revenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(month.expenses)}</TableCell>
                    <TableCell align="right">
                      <Typography
                        color={month.profit >= 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {formatCurrency(month.profit)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ))}
    </Stack>
  );
}

// Arrears Aging Tab Component
function ArrearsAgingTab({
  propertyId,
  formatCurrency,
}: {
  propertyId: string;
  formatCurrency: (amount: number) => string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['arrearsAging', propertyId],
    queryFn: () => reportService.getArrearsAging(propertyId || undefined),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load arrears aging report
      </Alert>
    );
  }

  const buckets = ['0-30', '31-60', '61-90', '90+'] as const;
  const bucketColors = {
    '0-30': 'warning.lighter',
    '31-60': 'warning.main',
    '61-90': 'error.lighter',
    '90+': 'error.main',
  };

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Summary */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
        <Box>
          <Card sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Overdue
            </Typography>
            <Typography variant="h4">
              {formatCurrency(data?.summary.total_overdue || 0)}
            </Typography>
          </Card>
        </Box>
        <Box>
          <Card sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Overdue Invoices
            </Typography>
            <Typography variant="h4">{data?.summary.total_invoices}</Typography>
          </Card>
        </Box>
      </Box>

      {/* Aging Buckets */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
        {buckets.map((bucket) => {
          const bucketData = data?.aging_buckets[bucket];
          return (
            <Box key={bucket}>
              <Card sx={{ p: 2, bgcolor: bucketColors[bucket] }}>
                <Typography variant="body2" color="text.secondary">
                  {bucketData?.label}
                </Typography>
                <Typography variant="h5">{formatCurrency(bucketData?.total || 0)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {bucketData?.invoices.length} invoices
                </Typography>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Detailed Tables for Each Bucket */}
      {buckets.map((bucket) => {
        const bucketData = data?.aging_buckets[bucket];
        if (!bucketData?.invoices.length) return null;

        return (
          <Card key={bucket}>
            <Box sx={{ p: 2, bgcolor: bucketColors[bucket] }}>
              <Typography variant="h6">{bucketData.label}</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Due Date</TableCell>
                    <TableCell align="right">Days</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bucketData.invoices.map((invoice: any) => (
                    <TableRow key={invoice.invoice_id}>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.tenant_name}</TableCell>
                      <TableCell>{invoice.property_name}</TableCell>
                      <TableCell>{invoice.unit_number}</TableCell>
                      <TableCell align="right">{invoice.due_date}</TableCell>
                      <TableCell align="right">
                        <Chip label={invoice.days_overdue} color="error" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(invoice.balance)}</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={6} align="right">
                      <strong>Subtotal</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(bucketData.total)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        );
      })}
    </Stack>
  );
}

// Occupancy Trend Tab Component
function OccupancyTrendTab({
  propertyId,
  startDate,
  endDate,
}: {
  propertyId: string;
  startDate: string;
  endDate: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['occupancyTrend', propertyId, startDate, endDate],
    queryFn: () =>
      reportService.getOccupancyTrend({
        property_id: propertyId || undefined,
        start_date: startDate,
        end_date: endDate,
      }),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load occupancy trend
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {data?.occupancy_trends.map((property: any) => (
        <Card key={property.property.id} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {property.property.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Average Occupancy: {property.average_occupancy}%
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Total Units</TableCell>
                  <TableCell align="right">Occupied</TableCell>
                  <TableCell align="right">Vacant</TableCell>
                  <TableCell align="right">Occupancy Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {property.monthly_trend.map((month: any) => (
                  <TableRow key={month.month}>
                    <TableCell>{month.month}</TableCell>
                    <TableCell align="right">{month.total_units}</TableCell>
                    <TableCell align="right">{month.occupied_units}</TableCell>
                    <TableCell align="right">{month.vacant_units}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${month.occupancy_rate}%`}
                        color={month.occupancy_rate >= 90 ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ))}
    </Stack>
  );
}
