import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { type Property, propertyService, type PropertyFormData } from 'src/services/propertyService';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from './table-no-data';
import { TableEmptyRows } from './table-empty-rows';
import { PropertiesTableRow } from './properties-table-row';
import { PropertyFormDialog } from './property-form-dialog';
import { PropertiesTableHead } from './properties-table-head';

// ----------------------------------------------------------------------

export function PropertiesView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Fetch properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyService.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: propertyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyFormData> }) =>
      propertyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: propertyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelected(properties.map((n) => n.id));
        return;
      }
      setSelected([]);
    },
    [properties]
  );

  const handleClick = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  }, []);

  const handleOpenDialog = useCallback(() => {
    setEditingProperty(null);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingProperty(null);
  }, []);

  const handleEditRow = useCallback((property: Property) => {
    setEditingProperty(property);
    setOpenDialog(true);
  }, []);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this property?')) {
        await deleteMutation.mutateAsync(id);
      }
    },
    [deleteMutation]
  );

  const handleFormSubmit = useCallback(
    async (data: PropertyFormData) => {
      if (editingProperty) {
        await updateMutation.mutateAsync({ id: editingProperty.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    },
    [editingProperty, createMutation, updateMutation]
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - properties.length) : 0;
  const notFound = !isLoading && properties.length === 0;

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Properties</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenDialog}
        >
          New Property
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
                  <PropertiesTableHead
                    orderBy={orderBy}
                    rowCount={properties.length}
                    numSelected={selected.length}
                    onSelectAllRows={handleSelectAllClick}
                    headCells={[
                      { id: 'name', label: 'Property' },
                      { id: 'type', label: 'Type' },
                      { id: 'location', label: 'Location' },
                      { id: 'total_units', label: 'Total Units', align: 'center' },
                      { id: 'occupied_units', label: 'Occupied', align: 'center' },
                      { id: 'status', label: 'Status' },
                      { id: '', label: '' },
                    ]}
                  />
                  <TableBody>
                    {properties
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <PropertiesTableRow
                          key={row.id}
                          row={row}
                          selected={selected.includes(row.id)}
                          onSelectRow={() => handleClick(row.id)}
                          onEditRow={() => handleEditRow(row)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                        />
                      ))}

                    <TableEmptyRows height={68} emptyRows={emptyRows} />

                    {notFound && <TableNoData />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={properties.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      <PropertyFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        property={editingProperty}
      />
    </>
  );
}
