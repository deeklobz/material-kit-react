import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { invoiceService, type Invoice } from 'src/services/invoiceService';
import reportService from 'src/services/reportService';

// -----------------------------------------------------------------------

interface TaxSummary {
  month: string;
  totalTaxLiability: number;
  invoiceCount: number;
  mriTax: number;
  annualTax: number;
  withholdingTax: number;
  mriCount: number;
  annualCount: number;
  withholdingCount: number;
  invoices: Invoice[];
}

interface PropertyTaxSummary {
  propertyId: string;
  propertyName: string;
  totalTax: number;
  mriTax: number;
  annualTax: number;
  withholdingTax: number;
  invoiceCount: number;
}

export function TaxDashboardView() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().split('T')[0].substring(0, 7) // Current month in YYYY-MM format
  );
  const [tab, setTab] = useState('1');
  const [isExporting, setIsExporting] = useState(false);

  const { data: invoicesData, isLoading, error } = useQuery({
    queryKey: ['invoices', 'all'],
    queryFn: () => invoiceService.getAll(),
  });

  const invoices = useMemo(() => {
    const data = Array.isArray(invoicesData) ? invoicesData : invoicesData?.data || [];
    return data as Invoice[];
  }, [invoicesData]);

  // Monthly tax summary
  const monthlySummary = useMemo(() => {
    const summaryMap = new Map<string, TaxSummary>();

    invoices.forEach((invoice) => {
      const month = invoice.invoice_date.substring(0, 7); // YYYY-MM
      if (!summaryMap.has(month)) {
        summaryMap.set(month, {
          month,
          totalTaxLiability: 0,
          invoiceCount: 0,
          mriTax: 0,
          annualTax: 0,
          withholdingTax: 0,
          mriCount: 0,
          annualCount: 0,
          withholdingCount: 0,
          invoices: [],
        });
      }

      const summary = summaryMap.get(month)!;
      summary.totalTaxLiability += invoice.tax_amount || 0;
      summary.invoiceCount += 1;
      summary.invoices.push(invoice);

      if (invoice.tax_method === 'mri') {
        summary.mriTax += invoice.tax_amount || 0;
        summary.mriCount += 1;
      } else if (invoice.tax_method === 'annual') {
        summary.annualTax += invoice.tax_amount || 0;
        summary.annualCount += 1;
      } else if (invoice.tax_method === 'withholding') {
        summary.withholdingTax += invoice.tax_amount || 0;
        summary.withholdingCount += 1;
      }
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [invoices]);

  // Current month details
  const currentMonthSummary = useMemo(() => {
    return monthlySummary.find((s) => s.month === selectedMonth) || {
      month: selectedMonth,
      totalTaxLiability: 0,
      invoiceCount: 0,
      mriTax: 0,
      annualTax: 0,
      withholdingTax: 0,
      mriCount: 0,
      annualCount: 0,
      withholdingCount: 0,
      invoices: [],
    };
  }, [monthlySummary, selectedMonth]);

  // Property-level tax summary
  const propertyTaxSummary = useMemo(() => {
    const propertyMap = new Map<string, PropertyTaxSummary>();

    currentMonthSummary.invoices.forEach((invoice) => {
      const propertyId = (invoice as any).lease?.unit?.property_id || 'unknown';
      const propertyName = (invoice as any).lease?.unit?.property?.name || 'Unknown Property';

      if (!propertyMap.has(propertyId)) {
        propertyMap.set(propertyId, {
          propertyId,
          propertyName,
          totalTax: 0,
          mriTax: 0,
          annualTax: 0,
          withholdingTax: 0,
          invoiceCount: 0,
        });
      }

      const prop = propertyMap.get(propertyId)!;
      prop.totalTax += invoice.tax_amount || 0;
      prop.invoiceCount += 1;

      if (invoice.tax_method === 'mri') {
        prop.mriTax += invoice.tax_amount || 0;
      } else if (invoice.tax_method === 'annual') {
        prop.annualTax += invoice.tax_amount || 0;
      } else if (invoice.tax_method === 'withholding') {
        prop.withholdingTax += invoice.tax_amount || 0;
      }
    });

    return Array.from(propertyMap.values());
  }, [currentMonthSummary]);

  const getTaxMethodColor = (method: string) => {
    switch (method) {
      case 'mri':
        return 'info';
      case 'annual':
        return 'warning';
      case 'withholding':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const [year, month] = selectedMonth.split('-');
      const startDate = `${selectedMonth}-01`;
      const lastDay = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
      const endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

      const blob = await reportService.exportTaxCsv({
        start_date: startDate,
        end_date: endDate,
      });

      reportService.downloadCsv(blob, `tax_report_${selectedMonth}.csv`);
    } catch (err) {
      console.error('Failed to export tax report:', err);
      alert('Failed to export tax report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load tax data: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Tax Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Monthly rental income tax tracking and analysis
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:share-bold" />}
          onClick={handleExportCsv}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </Box>

      {/* Month Selector */}
      <Card sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Select Month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 200 }}
          />
          <Typography variant="body2" color="text.secondary">
            Total Invoices: {currentMonthSummary.invoiceCount}
          </Typography>
        </Stack>
      </Card>

      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        <Card sx={{ p: 2, bgcolor: '#f3f4f6' }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Total Tax Liability
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              KES {currentMonthSummary.totalTaxLiability.toLocaleString()}
            </Typography>
            <Chip
              label={`${currentMonthSummary.invoiceCount} invoices`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: '#e3f2fd' }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              MRI Method
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
              KES {currentMonthSummary.mriTax.toLocaleString()}
            </Typography>
            <Chip
              label={`${currentMonthSummary.mriCount} invoices`}
              size="small"
              color="info"
              variant="outlined"
            />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: '#fff3e0' }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Annual Method
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f57c00' }}>
              KES {currentMonthSummary.annualTax.toLocaleString()}
            </Typography>
            <Chip
              label={`${currentMonthSummary.annualCount} invoices`}
              size="small"
              color="warning"
              variant="outlined"
            />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: '#ffebee' }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Withholding Method
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f' }}>
              KES {currentMonthSummary.withholdingTax.toLocaleString()}
            </Typography>
            <Chip
              label={`${currentMonthSummary.withholdingCount} invoices`}
              size="small"
              color="error"
              variant="outlined"
            />
          </Stack>
        </Card>
      </Stack>

      {/* Tabs for detailed views */}
      <Card>
        <TabContext value={tab}>
          <TabList onChange={(_, newValue) => setTab(newValue)}>
            <Tab label="Monthly Summary" value="1" />
            <Tab label="Property Breakdown" value="2" />
            <Tab label="Invoice Details" value="3" />
          </TabList>

          {/* Monthly Summary Tab */}
          <TabPanel value="1" sx={{ p: 2 }}>
            <Scrollbar>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Total Tax</TableCell>
                    <TableCell align="right">MRI</TableCell>
                    <TableCell align="right">Annual</TableCell>
                    <TableCell align="right">Withholding</TableCell>
                    <TableCell align="right">Invoices</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlySummary.map((summary) => (
                    <TableRow
                      key={summary.month}
                      hover
                      sx={{
                        bgcolor: summary.month === selectedMonth ? '#f0f7ff' : 'white',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedMonth(summary.month)}
                    >
                      <TableCell>{summary.month}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        KES {summary.totalTaxLiability.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {summary.mriCount > 0 && (
                          <Chip
                            label={`KES ${summary.mriTax.toLocaleString()} (${summary.mriCount})`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summary.annualCount > 0 && (
                          <Chip
                            label={`KES ${summary.annualTax.toLocaleString()} (${summary.annualCount})`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summary.withholdingCount > 0 && (
                          <Chip
                            label={`KES ${summary.withholdingTax.toLocaleString()} (${summary.withholdingCount})`}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">{summary.invoiceCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
            {monthlySummary.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No tax data available</Typography>
              </Box>
            )}
          </TabPanel>

          {/* Property Breakdown Tab */}
          <TabPanel value="2" sx={{ p: 2 }}>
            <Scrollbar>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Property</TableCell>
                    <TableCell align="right">Total Tax</TableCell>
                    <TableCell align="right">MRI</TableCell>
                    <TableCell align="right">Annual</TableCell>
                    <TableCell align="right">Withholding</TableCell>
                    <TableCell align="right">Invoices</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {propertyTaxSummary.map((prop) => (
                    <TableRow key={prop.propertyId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{prop.propertyName}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        KES {prop.totalTax.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {prop.mriTax > 0 && (
                          <Chip
                            label={`KES ${prop.mriTax.toLocaleString()}`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {prop.annualTax > 0 && (
                          <Chip
                            label={`KES ${prop.annualTax.toLocaleString()}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {prop.withholdingTax > 0 && (
                          <Chip
                            label={`KES ${prop.withholdingTax.toLocaleString()}`}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">{prop.invoiceCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
            {propertyTaxSummary.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No property data for selected month</Typography>
              </Box>
            )}
          </TabPanel>

          {/* Invoice Details Tab */}
          <TabPanel value="3" sx={{ p: 2 }}>
            <Scrollbar>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell>Tax Method</TableCell>
                    <TableCell align="right">Tax Rate</TableCell>
                    <TableCell align="right">Tax Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentMonthSummary.invoices
                    .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime())
                    .map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{invoice.invoice_number}</TableCell>
                        <TableCell>
                          {invoice.tenant ? `${invoice.tenant.first_name} ${invoice.tenant.last_name}` : '-'}
                        </TableCell>
                        <TableCell align="right">KES {Number(invoice.subtotal).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={(invoice.tax_method || 'N/A').toUpperCase()}
                            size="small"
                            color={getTaxMethodColor(invoice.tax_method || '')}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">{((invoice.tax_rate || 0) * 100).toFixed(2)}%</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                          KES {Number(invoice.tax_amount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Scrollbar>
            {currentMonthSummary.invoices.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No invoices for selected month</Typography>
              </Box>
            )}
          </TabPanel>
        </TabContext>
      </Card>

      {/* Information Box */}
      <Alert severity="info">
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          💡 Tax Information
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This dashboard aggregates rental income tax calculated for all invoices. Taxes are shown for your compliance
          reference only and are not charged to tenants.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          • <strong>MRI Method:</strong> 7.5% of monthly rent (for residents earning KSh 288k-15M annually) •{' '}
          <strong>Annual Method:</strong> Graduated rates 10-30% based on annual income with expense deductions •{' '}
          <strong>Withholding:</strong> 10% for residents / 30% for non-residents
        </Typography>
      </Alert>
    </Stack>
  );
}
