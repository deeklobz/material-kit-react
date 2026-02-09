import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { type SubscriptionPlan, subscriptionPlanService } from 'src/services/subscriptionService';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { SubscriptionPlanFormDialog } from './subscription-plan-form-dialog';

// ----------------------------------------------------------------------

export function SubscriptionPlansView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionPlanService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: subscriptionPlanService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      setOpenDialog(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subscriptionPlanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      setOpenDialog(false);
      setEditingPlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subscriptionPlanService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });

  const handleDeleteRow = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this plan?')) {
        await deleteMutation.mutateAsync(id);
      }
    },
    [deleteMutation]
  );

  const handleOpenDialog = useCallback((plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingPlan(null);
  }, []);

  const handleSubmit = useCallback(
    async (data: any) => {
      if (editingPlan) {
        await updateMutation.mutateAsync({ id: editingPlan.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    },
    [editingPlan, createMutation, updateMutation]
  );

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Subscription Plans</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenDialog()}
        >
          New Plan
        </Button>
      </Box>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox />
                      </TableCell>
                      <TableCell>Plan Name</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Billing Cycle</TableCell>
                      <TableCell>Trial Days</TableCell>
                      <TableCell>Limits</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plans
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((plan) => (
                        <PlanTableRow
                          key={plan.id}
                          plan={plan}
                          onEdit={() => handleOpenDialog(plan)}
                          onDelete={() => handleDeleteRow(plan.id)}
                        />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={plans.length}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={(e) => {
                setPage(0);
                setRowsPerPage(parseInt(e.target.value, 10));
              }}
            />
          </>
        )}
      </Card>

      <SubscriptionPlanFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        plan={editingPlan}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function PlanTableRow({
  plan,
  onEdit,
  onDelete,
}: {
  plan: SubscriptionPlan;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <Checkbox />
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2">{plan.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {plan.code}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2">KSh {plan.price.toLocaleString()}</Typography>
        </TableCell>
        <TableCell>
          <Chip label={plan.billing_cycle} size="small" />
        </TableCell>
        <TableCell>{plan.trial_days} days</TableCell>
        <TableCell>
          <Typography variant="body2">
            {plan.max_properties ? `${plan.max_properties} properties` : 'Unlimited properties'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {plan.max_units ? `${plan.max_units} units` : 'Unlimited units'}
          </Typography>
        </TableCell>
        <TableCell>
          <Label color={plan.is_active ? 'success' : 'error'}>
            {plan.is_active ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={(e) => setOpenPopover(e.currentTarget)}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={() => setOpenPopover(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
            },
          }}
        >
          <MenuItem onClick={onEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon={"solar:trash-bin-trash-bold" as any} />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
