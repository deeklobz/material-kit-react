import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
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

import { type Organization, organizationService } from 'src/services/organizationService';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { OrganizationFormDialog } from './organization-form-dialog';

// ----------------------------------------------------------------------

export function OrganizationsView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: organizationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setOpenDialog(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => organizationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setOpenDialog(false);
      setEditingOrg(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: organizationService.suspend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: organizationService.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const handleDeleteRow = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this organization?')) {
        await deleteMutation.mutateAsync(id);
      }
    },
    [deleteMutation]
  );

  const handleSuspendRow = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to suspend this organization?')) {
        await suspendMutation.mutateAsync(id);
      }
    },
    [suspendMutation]
  );

  const handleActivateRow = useCallback(
    async (id: string) => {
      await activateMutation.mutateAsync(id);
    },
    [activateMutation]
  );

  const handleOpenDialog = useCallback((org?: Organization) => {
    if (org) {
      setEditingOrg(org);
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingOrg(null);
  }, []);

  const handleSubmit = useCallback(
    async (data: any) => {
      if (editingOrg) {
        await updateMutation.mutateAsync({ id: editingOrg.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    },
    [editingOrg, createMutation, updateMutation]
  );

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Organizations</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenDialog()}
        >
          New Organization
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
                      <TableCell>Organization</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Subscription</TableCell>
                      <TableCell>Properties</TableCell>
                      <TableCell>Users</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {organizations
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((org) => (
                        <OrganizationTableRow
                          key={org.id}
                          organization={org}
                          onEdit={() => handleOpenDialog(org)}
                          onDelete={() => handleDeleteRow(org.id)}
                          onSuspend={() => handleSuspendRow(org.id)}
                          onActivate={() => handleActivateRow(org.id)}
                        />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={organizations.length}
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

      <OrganizationFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        organization={editingOrg}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function OrganizationTableRow({
  organization,
  onEdit,
  onDelete,
  onSuspend,
  onActivate,
}: {
  organization: Organization;
  onEdit: () => void;
  onDelete: () => void;
  onSuspend: () => void;
  onActivate: () => void;
}) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <Checkbox />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar>{organization.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="subtitle2">{organization.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {organization.code}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{organization.email}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {organization.phone}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{organization.subscription_plan || 'No Plan'}</Typography>
          <Label
            color={
              (organization.subscription_status === 'active' && 'success') ||
              (organization.subscription_status === 'trial' && 'info') ||
              (organization.subscription_status === 'expired' && 'error') ||
              'default'
            }
          >
            {organization.subscription_status || 'none'}
          </Label>
        </TableCell>
        <TableCell>{organization.properties_count || 0}</TableCell>
        <TableCell>{organization.users_count || 0}</TableCell>
        <TableCell>
          <Label
            color={
              (organization.status === 'active' && 'success') ||
              (organization.status === 'suspended' && 'error') ||
              'default'
            }
          >
            {organization.status}
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
          <MenuItem onClick={onEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          {organization.status === 'active' ? (
            <MenuItem onClick={onSuspend} sx={{ color: 'warning.main' }}>
              <Iconify icon={"solar:pause-bold" as any} />
              Suspend
            </MenuItem>
          ) : (
            <MenuItem onClick={onActivate} sx={{ color: 'success.main' }}>
              <Iconify icon={"solar:play-bold" as any} />
              Activate
            </MenuItem>
          )}
          <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon={"solar:trash-bin-trash-bold" as any} />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
