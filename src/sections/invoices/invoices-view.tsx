import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { invoiceService, type Invoice, type InvoiceFormData, type InvoiceLineItem } from 'src/services/invoiceService';
import { additionalChargeService, type AdditionalCharge } from 'src/services/additionalChargeService';
import { tenantService, type Tenant } from 'src/services/tenantService';
import { leaseService } from 'src/services/leaseService';
import { calculateInvoiceTax, getTaxRecommendations } from 'src/services/taxService';

// ----------------------------------------------------------------------

export function InvoicesView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [formData, setFormData] = useState({
    tenant_id: '',
    lease_id: '',
    invoice_number: '',
    type: 'rent' as const,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    subtotal: 0,
    tax_amount: 0,
    tax_rate: 0,
    tax_method: 'mri' as 'mri' | 'annual' | 'withholding',
    total_amount: 0,
    notes: '',
    status: 'draft' as const,
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: '', type: 'other', quantity: 1, unit_price: 0, amount: 0, total: 0 }
  ]);

  const [showTaxRecommendations, setShowTaxRecommendations] = useState(false);
  const [taxRecommendations, setTaxRecommendations] = useState<string[]>([]);

  const { data: invoicesData, isLoading, error } = useQuery({
    queryKey: ['invoices', page],
    queryFn: () => invoiceService.getAll({ page: page + 1 }),
  });

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantService.getAll,
  });

  const { data: leasesData } = useQuery({
    queryKey: ['active-leases'],
    queryFn: () => leaseService.getAll({ status: 'active', per_page: 500 }),
  });

  const { data: chargesData } = useQuery({
    queryKey: ['additional-charges'],
    queryFn: () => additionalChargeService.getCharges({ status: 'active', per_page: 500 }),
  });

  const createMutation = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: invoiceService.sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const invoices = invoicesData?.data || invoicesData || [];
  const totalInvoices = invoicesData?.total || invoices.length;
  const rowsPerPage = invoicesData?.per_page || invoices.length || 20;

  const tenants = useMemo(() => {
    return Array.isArray(tenantsData) ? tenantsData : (tenantsData as any)?.data || [];
  }, [tenantsData]);

  const leases = leasesData?.data || leasesData || [];
  const charges = chargesData?.data || chargesData || [];

  const getDueDate = (issueDate: string, rentDay?: number) => {
    if (!rentDay) return issueDate;
    const issue = new Date(issueDate);
    const due = new Date(issue.getFullYear(), issue.getMonth(), rentDay);
    if (due < issue) {
      due.setMonth(due.getMonth() + 1);
    }
    return due.toISOString().split('T')[0];
  };

  const isChargeApplicable = (charge: AdditionalCharge, issueDate: string) => {
    if (charge.status !== 'active') return false;
    const issue = new Date(issueDate);
    const start = charge.start_date ? new Date(charge.start_date) : null;
    const end = charge.end_date ? new Date(charge.end_date) : null;
    if (start && issue < start) return false;
    if (end && issue > end) return false;
    return true;
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', type: 'other', quantity: 1, unit_price: 0, amount: 0, total: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      const qty = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const price = field === 'unit_price' ? Number(value) : newItems[index].unit_price;
      const amount = qty * price;
      newItems[index].amount = amount;
      newItems[index].total = amount;
    }
    
    setLineItems(newItems);
    
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    // Note: Tax is NOT added to tenant invoice total (landlord responsibility)
    setFormData({ ...formData, subtotal, total_amount: subtotal });
  };

  const calculateTaxForSubtotal = (subtotal: number) => {
    if (formData.type !== 'rent') return { taxAmount: 0, taxRate: 0, method: 'mri' as 'mri' | 'annual' | 'withholding' };

    const monthlyRent = subtotal; // Assuming subtotal is primarily rent
    const taxResult = calculateInvoiceTax({
      monthlyRent,
      propertyType: 'residential',
      isNonResident: false,
    });

    return {
      taxAmount: taxResult.taxAmount,
      taxRate: taxResult.taxRate,
      method: taxResult.method as 'mri' | 'annual' | 'withholding',
    };
  };

  const handleSubtotalChange = (newSubtotal: number) => {
    const { taxAmount, taxRate, method } = calculateTaxForSubtotal(newSubtotal);
    // Note: Tax is NOT added to tenant invoice (it's a landlord tax responsibility)
    const total = newSubtotal; // Tenant pays only subtotal

    setFormData({
      ...formData,
      subtotal: newSubtotal,
      tax_amount: taxAmount,
      tax_rate: taxRate,
      tax_method: method,
      total_amount: total,
    });

    // Show tax recommendations
    const recommendations = getTaxRecommendations(newSubtotal);
    setTaxRecommendations(recommendations);
  };

  const handleCreate = useCallback(async () => {
    try {
      if (!formData.tenant_id) {
        alert('Tenant is required.');
        return;
      }
      if (!formData.invoice_number) {
        const generated = `INV-${Date.now().toString().slice(-8)}`;
        setFormData((prev) => ({ ...prev, invoice_number: generated }));
      }
      if (!formData.due_date) {
        alert('Due date is required.');
        return;
      }
      if (lineItems.some(item => !item.description || item.quantity <= 0 || item.unit_price <= 0)) {
        alert('All line items must have description, quantity, and unit price.');
        return;
      }

      const invoiceNumber = formData.invoice_number || `INV-${Date.now().toString().slice(-8)}`;

      await createMutation.mutateAsync({
        ...formData,
        invoice_number: invoiceNumber,
        line_items: lineItems,
      });

      setOpenCreate(false);
      setFormData({
        tenant_id: '',
        lease_id: '',
        invoice_number: '',
        type: 'rent',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        subtotal: 0,
        tax_amount: 0,
        tax_rate: 0,
        tax_method: 'mri' as 'mri' | 'annual' | 'withholding',
        total_amount: 0,
        notes: '',
        status: 'draft',
      });
      setLineItems([{ description: '', type: 'other', quantity: 1, unit_price: 0, amount: 0, total: 0 }]);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create invoice.';
      alert(message);
    }
  }, [createMutation, formData, lineItems]);

  const handleGenerateInvoices = useCallback(async () => {
    if (isGenerating) return;
    if (!window.confirm('Generate invoices for all active leases?')) return;

    setIsGenerating(true);
    try {
      const issueDate = new Date().toISOString().split('T')[0];
      const currentMonth = issueDate.substring(0, 7); // YYYY-MM
      let created = 0;
      let skipped = 0;

      // Get existing invoices for current month to avoid duplicates
      const existingInvoices = invoices.filter((inv: Invoice) => 
        inv.invoice_date.startsWith(currentMonth)
      );

      for (const lease of leases) {
        // Check if invoice already exists for this lease this month
        const alreadyExists = existingInvoices.some((inv: Invoice) => inv.lease_id === lease.id);
        
        if (alreadyExists) {
          skipped++;
          continue;
        }

        const invoiceNumber = `INV-${issueDate.replace(/-/g, '')}-${lease.id.slice(0, 6).toUpperCase()}`;
        const dueDate = getDueDate(issueDate, lease.rent_day);

        const applicableCharges = charges.filter((charge: AdditionalCharge) => {
          if (!isChargeApplicable(charge, issueDate)) return false;
          if (charge.scope === 'unit' && charge.unit_id === lease.unit_id) return true;
          if (charge.scope === 'property' && charge.property_id === lease.unit?.property?.id) return true;
          return false;
        });

        const rentLineItem: InvoiceLineItem = {
          description: `Monthly Rent - ${lease.unit?.unit_number || ''}`.trim(),
          type: 'rent',
          quantity: 1,
          unit_price: Number(lease.rent_amount),
          amount: Number(lease.rent_amount),
          total: Number(lease.rent_amount),
        };

        const chargeLineItems: InvoiceLineItem[] = applicableCharges
          .filter((charge: AdditionalCharge) => {
            if (charge.billing_type === 'recurring') return true;
            if (charge.billing_type === 'one_time') return true;
            return false;
          })
          .map((charge: AdditionalCharge) => ({
            description: charge.name,
            type: 'other',
            quantity: 1,
            unit_price: Number(charge.amount),
            amount: Number(charge.amount),
            total: Number(charge.amount),
          }));

        const items = [rentLineItem, ...chargeLineItems];
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);

        // Calculate tax automatically for rent invoices (for landlord reference only)
        // NOTE: Tax is NOT charged to tenant - landlord pays it from rent received
        const { taxAmount, taxRate, method } = calculateTaxForSubtotal(subtotal);
        const totalAmount = subtotal; // Tenant invoice total = subtotal only

        await invoiceService.create({
          tenant_id: lease.tenant_id,
          lease_id: lease.id,
          invoice_number: invoiceNumber,
          type: 'rent',
          invoice_date: issueDate,
          due_date: dueDate,
          subtotal,
          tax_amount: taxAmount,
          tax_rate: taxRate,
          tax_method: method,
          total_amount: totalAmount,
          notes: lease.terms ? `Lease Terms: ${lease.terms}` : undefined,
          status: 'draft',
          line_items: items,
        });
        created++;
      }

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      const message = skipped > 0 
        ? `Created ${created} invoice(s). Skipped ${skipped} (already exist for this month).`
        : `Invoices generated successfully (${created} created).`;
      alert(message);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to generate invoices.';
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  }, [charges, isGenerating, leases, queryClient, invoices]);

  const handleSendInvoice = useCallback(async (invoiceId: string) => {
    try {
      await sendMutation.mutateAsync(invoiceId);
      handleMenuClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send invoice.';
      alert(message);
    }
  }, [sendMutation]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, invoice: Invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewInvoice = useCallback(async () => {
    if (!selectedInvoice) return;
    try {
      const fullInvoice = await invoiceService.getById(selectedInvoice.id);
      setSelectedInvoice(fullInvoice);
      setOpenView(true);
      handleMenuClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load invoice details.';
      alert(message);
    }
  }, [selectedInvoice]);

  const handleDownloadInvoice = () => {
    if (!selectedInvoice) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const lineItemsForPrint = (selectedInvoice as any).lineItems || (selectedInvoice as any).line_items || [];
    const invoiceDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${selectedInvoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
            .field { margin-bottom: 8px; }
            .field-label { font-weight: bold; display: inline-block; width: 180px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f3f3; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p><strong>Invoice Number:</strong> ${selectedInvoice.invoice_number}</p>
          </div>

          <div class="section">
            <div class="section-title">Tenant Details</div>
            <div class="field"><span class="field-label">Name:</span> ${selectedInvoice.tenant?.first_name || ''} ${selectedInvoice.tenant?.last_name || ''}</div>
            <div class="field"><span class="field-label">Email:</span> ${selectedInvoice.tenant?.email || 'N/A'}</div>
            <div class="field"><span class="field-label">Phone:</span> ${selectedInvoice.tenant?.phone || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Invoice Details</div>
            <div class="field"><span class="field-label">Invoice Date:</span> ${new Date(selectedInvoice.invoice_date).toLocaleDateString()}</div>
            <div class="field"><span class="field-label">Due Date:</span> ${new Date(selectedInvoice.due_date).toLocaleDateString()}</div>
            <div class="field"><span class="field-label">Status:</span> ${selectedInvoice.status.toUpperCase()}</div>
            <div class="field"><span class="field-label">Type:</span> ${selectedInvoice.type || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Line Items</div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${(lineItemsForPrint || [])
                  .map(
                    (item: InvoiceLineItem) => `
                      <tr>
                        <td>${item.description}</td>
                        <td>${item.type}</td>
                        <td>${item.quantity}</td>
                        <td>KES ${Number(item.unit_price).toLocaleString()}</td>
                        <td>KES ${Number(item.total).toLocaleString()}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Invoice Totals</div>
            <div class="field"><span class="field-label">Rent + Charges:</span> KES ${Number(selectedInvoice.subtotal).toLocaleString()}</div>
            <div class="field" style="border-top: 2px solid #333; padding-top: 8px; margin-top: 8px; font-weight: bold;"><span class="field-label">Amount Due:</span> KES ${Number(selectedInvoice.total_amount).toLocaleString()}</div>
            <div class="field"><span class="field-label">Balance:</span> KES ${Number(selectedInvoice.balance || selectedInvoice.total_amount).toLocaleString()}</div>
          </div>

          ${selectedInvoice.notes ? `<div class="section"><div class="section-title">Notes</div>${selectedInvoice.notes}</div>` : ''}

          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #1976d2; color: white; border: none; cursor: pointer; border-radius: 4px;">Print / Save as PDF</button>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceDocument);
    printWindow.document.close();
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    setFormData({ ...formData, invoice_number: `INV-${timestamp}` });
  };

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Invoices</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Monthly Invoices'}
          </Button>
          <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpenCreate(true)}>
            New Invoice
          </Button>
        </Stack>
      </Box>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">
              Failed to load invoices: {error instanceof Error ? error.message : 'Unknown error'}
            </Typography>
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Issue Date</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice: any) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>
                          {invoice.tenant ? `${invoice.tenant.first_name} ${invoice.tenant.last_name}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip label={invoice.type} size="small" />
                        </TableCell>
                        <TableCell>{invoice.invoice_date}</TableCell>
                        <TableCell>{invoice.due_date}</TableCell>
                        <TableCell>KES {Number(invoice.total_amount).toLocaleString()}</TableCell>
                        <TableCell>KES {Number(invoice.balance || invoice.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Label
                            color={
                              (invoice.status === 'paid' && 'success') ||
                              (invoice.status === 'overdue' && 'error') ||
                              (invoice.status === 'partial' && 'warning') ||
                              (invoice.status === 'sent' && 'info') ||
                              'default'
                            }
                          >
                            {invoice.status}
                          </Label>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleMenuOpen(e, invoice)}>
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={totalInvoices}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </>
        )}
      </Card>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 160,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
            },
          }}
        >
          <MenuItem onClick={handleViewInvoice}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
          {selectedInvoice?.status === 'draft' && (
            <MenuItem onClick={() => selectedInvoice && handleSendInvoice(selectedInvoice.id)}>
              <Iconify icon="solar:share-bold" />
              Send Invoice
            </MenuItem>
          )}
        </MenuList>
      </Popover>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Invoice</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Invoice Number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <Button size="small" onClick={generateInvoiceNumber}>
                      Generate
                    </Button>
                  ),
                }}
              />
              <TextField
                select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                fullWidth
                required
              >
                <MenuItem value="rent">Rent</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="utilities">Utilities</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="penalty">Penalty</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Stack>

            <TextField
              select
              label="Tenant"
              value={formData.tenant_id}
              onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
              fullWidth
              required
            >
              {tenants.map((tenant: Tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.first_name} {tenant.last_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Lease (Optional)"
              value={formData.lease_id}
              onChange={(e) => setFormData({ ...formData, lease_id: e.target.value })}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {leases.map((lease: any) => (
                <MenuItem key={lease.id} value={lease.id}>
                  {lease.lease_number} - {lease.tenant?.first_name} {lease.tenant?.last_name}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Invoice Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                fullWidth
                required
              />
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Line Items</Typography>
            {lineItems.map((item, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  label="Type"
                  value={item.type}
                  onChange={(e) => handleLineItemChange(index, 'type', e.target.value)}
                  sx={{ width: 140 }}
                >
                  <MenuItem value="rent">Rent</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                  <MenuItem value="water">Water</MenuItem>
                  <MenuItem value="electricity">Electricity</MenuItem>
                  <MenuItem value="garbage">Garbage</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="late_fee">Late Fee</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                  sx={{ width: 100 }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                  sx={{ width: 120 }}
                />
                <TextField
                  label="Total"
                  value={item.total}
                  disabled
                  sx={{ width: 120 }}
                />
                <IconButton
                  onClick={() => handleRemoveLineItem(index)}
                  disabled={lineItems.length === 1}
                  color="error"
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={handleAddLineItem} startIcon={<Iconify icon="mingcute:add-line" />}>
              Add Line Item
            </Button>

            <Box sx={{ p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#856404' }}>
                💡 Tax Information (Landlord Reference Only)
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: '#856404', fontStyle: 'italic' }}>
                  📌 Note: Rental income tax is NOT charged to tenants. This is calculated for your tax compliance reference. The tenant invoice shows only the rent + charges they owe.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">Your Tax Method:</Typography>
                  <Chip 
                    label={formData.tax_method?.toUpperCase() || 'MRI'} 
                    size="small" 
                    variant="outlined"
                    color="warning"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Your Tax Rate:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {(formData.tax_rate * 100).toFixed(2)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f5f5f5', p: 1, borderRadius: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Your Tax Liability:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    KES {formData.tax_amount.toLocaleString()}
                  </Typography>
                </Box>
                {taxRecommendations.length > 0 && (
                  <Box>
                    <Button
                      size="small"
                      onClick={() => setShowTaxRecommendations(!showTaxRecommendations)}
                    >
                      {showTaxRecommendations ? '▼' : '▶'} Tax Recommendations
                    </Button>
                    {showTaxRecommendations && (
                      <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid #ffc107' }}>
                        {taxRecommendations.map((rec, idx) => (
                          <Typography key={idx} variant="caption" display="block" sx={{ mt: 0.5, color: '#856404' }}>
                            {rec}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Stack>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Tenant Invoice Total (Subtotal)"
                value={formData.subtotal}
                disabled
                fullWidth
                helperText="Amount tenant owes (tax is NOT added)"
              />
              <TextField
                label="Your Tax Amount (Reference)"
                type="number"
                value={formData.tax_amount}
                disabled
                fullWidth
                helperText="Not charged to tenant"
              />
            </Stack>

            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Details - {selectedInvoice?.invoice_number}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2">Tenant</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedInvoice?.tenant?.first_name} {selectedInvoice?.tenant?.last_name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Type: {selectedInvoice?.type || 'N/A'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Issue: {selectedInvoice?.invoice_date ? new Date(selectedInvoice.invoice_date).toLocaleDateString() : 'N/A'} | Due: {selectedInvoice?.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Line Items</Typography>
              {(((selectedInvoice as any)?.lineItems || (selectedInvoice as any)?.line_items) || []).map((item: any, idx: number) => (
                <Typography key={idx} variant="body2" color="text.secondary">
                  {item.description} ({item.type}) - {item.quantity} x KES {item.unit_price} = KES {item.total}
                </Typography>
              ))}
            </Box>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                💰 Invoice Summary
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Rent + Charges:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>KES {selectedInvoice?.subtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid #ddd', pt: 1, bgcolor: '#ffffff', p: 1, borderRadius: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Tenant Owes:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>KES {selectedInvoice?.total_amount.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                  <Typography variant="body2">Balance Due:</Typography>
                  <Typography variant="body2">KES {(selectedInvoice?.balance || selectedInvoice?.total_amount || 0).toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
          <Button onClick={handleDownloadInvoice} variant="contained" startIcon={<Iconify icon="solar:share-bold" />}>
            Download / Print
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
