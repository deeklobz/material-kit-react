import { usePopover } from 'minimal-shared/hooks';
import { useMemo, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import subscriptionManagementService, {
  type ActiveSubscription,
} from 'src/services/subscriptionManagementService';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'organization', label: 'Organization' },
  { id: 'plan', label: 'Plan' },
  { id: 'status', label: 'Status' },
  { id: 'billing', label: 'Billing' },
  { id: 'usage', label: 'Usage' },
  { id: 'dates', label: 'Dates' },
  { id: 'actions', label: 'Actions', align: 'right' },
];

// ----------------------------------------------------------------------

export function ActiveSubscriptionsView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['active-subscriptions'],
    queryFn: subscriptionManagementService.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: subscriptionManagementService.getStats,
  });

  const cancelMutation = useMutation({
    mutationFn: subscriptionManagementService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
    },
  });

  const renewMutation = useMutation({
    mutationFn: subscriptionManagementService.renew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-subscriptions'] });
    },
  });

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleCancelSubscription = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to cancel this subscription?')) {
        await cancelMutation.mutateAsync(id);
      }
    },
    [cancelMutation]
  );

  const handleRenewSubscription = useCallback(
    async (id: string) => {
      await renewMutation.mutateAsync(id);
    },
    [renewMutation]
  );

  const paginatedData = useMemo(
    () => subscriptions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [subscriptions, page, rowsPerPage]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'past_due':
        return 'warning';
      case 'cancelled':
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Active Subscriptions</Typography>
      </Box>

      {stats && (
        <Box sx={{ mb: 3, display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Subscriptions
            </Typography>
            <Typography variant="h4">{stats.total_subscriptions}</Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Active
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.active_subscriptions}
            </Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              On Trial
            </Typography>
            <Typography variant="h4" color="info.main">
              {stats.trial_subscriptions}
            </Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Monthly Revenue
            </Typography>
            <Typography variant="h4" color="primary.main">
              KES {stats.monthly_revenue.toLocaleString()}
            </Typography>
          </Card>
        </Box>
      )}

      <Card>
        {isLoading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table sx={{ minWidth: 960 }}>
                  <TableHead>
                    <TableRow>
                      {TABLE_HEAD.map((headCell) => (
                        <TableCell key={headCell.id} align={headCell.align as any}>
                          {headCell.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((subscription) => (
                      <SubscriptionRow
                        key={subscription.id}
                        subscription={subscription}
                        onCancel={() => handleCancelSubscription(subscription.id)}
                        onRenew={() => handleRenewSubscription(subscription.id)}
                        getStatusColor={getStatusColor}
                      />
                    ))}

                    {!paginatedData.length && (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEAD.length} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            No subscriptions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePagination
              component="div"
              page={page}
              count={subscriptions.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

type SubscriptionRowProps = {
  subscription: ActiveSubscription;
  onCancel: () => void;
  onRenew: () => void;
  getStatusColor: (status: string) => any;
};

function SubscriptionRow({ subscription, onCancel, onRenew, getStatusColor }: SubscriptionRowProps) {
  const popover = usePopover();

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Box>
            <Typography variant="subtitle2">{subscription.organization_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {subscription.organization_code}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Box>
            <Typography variant="body2">{subscription.plan_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {subscription.plan_code}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Chip label={subscription.status} color={getStatusColor(subscription.status)} size="small" />
        </TableCell>

        <TableCell>
          <Box>
            <Typography variant="body2">
              {subscription.currency} {subscription.amount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subscription.auto_renew ? 'Auto-renew' : 'Manual'}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Box>
            <Typography variant="caption" display="block">
              {subscription.properties_count || 0} properties
            </Typography>
            <Typography variant="caption" display="block">
              {subscription.units_count || 0} units
            </Typography>
            <Typography variant="caption" display="block">
              {subscription.users_count || 0} users
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Box>
            <Typography variant="caption" display="block">
              Start: {new Date(subscription.start_date).toLocaleDateString()}
            </Typography>
            {subscription.trial_ends_at && (
              <Typography variant="caption" display="block" color="info.main">
                Trial ends: {new Date(subscription.trial_ends_at).toLocaleDateString()}
              </Typography>
            )}
            {subscription.next_billing_date && (
              <Typography variant="caption" display="block">
                Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </TableCell>

        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList>
          {subscription.status === 'active' && (
            <MenuItem onClick={() => { popover.onClose(); onRenew(); }}>
              <Iconify icon="solar:restart-bold" />
              Renew
            </MenuItem>
          )}
          {(subscription.status === 'active' || subscription.status === 'trial') && (
            <MenuItem onClick={() => { popover.onClose(); onCancel(); }} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Cancel
            </MenuItem>
          )}
        </MenuList>
      </Popover>
    </>
  );
}
