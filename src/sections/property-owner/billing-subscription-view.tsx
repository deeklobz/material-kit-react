import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

// -----------------------------------------------------------------------

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export function BillingSubscriptionView() {
  const theme = useTheme();
  const [subscriptionPlan] = useState('Professional');
  const [trialDaysRemaining] = useState(11);
  const [currentAmount] = useState(5000);
  const [renewalDate] = useState('2024-03-15');

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
    },
  ]);

  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV001',
      date: '2024-02-01',
      amount: 5000,
      status: 'paid',
      dueDate: '2024-02-15',
    },
    {
      id: 'INV002',
      date: '2024-01-01',
      amount: 5000,
      status: 'paid',
      dueDate: '2024-01-15',
    },
  ]);

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPaymentMethod = async () => {
    try {
      // TODO: Call API to add payment method
      console.log('Adding payment method:', cardData);
      setOpenPaymentDialog(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        // TODO: Call API to delete payment method
        setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // TODO: Call API to set default payment method
      setPaymentMethods((prev) =>
        prev.map((p) => ({
          ...p,
          isDefault: p.id === id,
        }))
      );
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
  };

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Billing & Subscription
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage your subscription plan, billing, and payment methods
        </Typography>
      </Box>

      {/* Trial Warning */}
      {trialDaysRemaining > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<Iconify icon="solar:pen-bold" />}>
          Your free trial ends in {trialDaysRemaining} days. Please add a payment method to continue using the service
          after the trial period.
        </Alert>
      )}

      {/* Current Subscription Card */}
      <Card sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Current Plan
            </Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>
              {subscriptionPlan}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              KSh {currentAmount.toLocaleString()} / month
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Next billing date: {new Date(renewalDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined">Change Plan</Button>
              <Button variant="outlined" color="error">
                Cancel Subscription
              </Button>
            </Stack>
          </Box>
          <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Features Included
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
                <Typography variant="body2">Up to 50 properties</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
                <Typography variant="body2">Unlimited users</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
                <Typography variant="body2">M-Pesa payments</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
                <Typography variant="body2">Priority support</Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Card>

      {/* Payment Methods */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payment Methods
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => setOpenPaymentDialog(true)}
          >
            Add Card
          </Button>
        </Box>

        {paymentMethods.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No payment methods added yet
          </Typography>
        ) : (
          <Stack spacing={2}>
            {paymentMethods.map((method) => (
              <Card key={method.id} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Iconify
                      icon={method.type === 'card' ? 'solar:cart-3-bold' : 'solar:share-bold'}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {method.brand} ending in {method.last4}
                      </Typography>
                      {method.expiryMonth && method.expiryYear && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {method.isDefault && <Chip label="Default" size="small" color="primary" />}
                    {!method.isDefault && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        )}
      </Card>

      {/* Billing History */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Billing History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main', cursor: 'pointer' }}>
                      {invoice.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      KSh {invoice.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      size="small"
                      color={statusColors[invoice.status]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="text" startIcon={<Iconify icon="solar:pen-bold" />}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment Method</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={cardData.cardNumber}
              onChange={handleCardChange}
              placeholder="1234 5678 9012 3456"
            />
            <TextField
              fullWidth
              label="Cardholder Name"
              name="cardName"
              value={cardData.cardName}
              onChange={handleCardChange}
              placeholder="John Doe"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                value={cardData.expiryDate}
                onChange={handleCardChange}
                placeholder="MM/YY"
              />
              <TextField
                fullWidth
                label="CVV"
                name="cvv"
                value={cardData.cvv}
                onChange={handleCardChange}
                placeholder="123"
                type="password"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPaymentMethod}>
            Add Card
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
