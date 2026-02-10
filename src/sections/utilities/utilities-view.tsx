import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { propertyService, type Property } from 'src/services/propertyService';
import { unitService, type Unit } from 'src/services/unitService';
import { utilityService, type Meter, type UtilityType, type UtilityTariff } from 'src/services/utilityService';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

function isoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getLatestReading(m: Meter): any {
  return (m as any).latest_reading ?? (m as any).latestReading ?? null;
}

function formatNumber(value: any): string {
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function getAssignedUnitIds(m: any): string[] {
  const list = m?.assigned_units ?? m?.assignedUnits ?? [];
  if (!Array.isArray(list)) return [];
  return list.map((u: any) => u?.id).filter(Boolean);
}

export function UtilitiesView() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState(0);
  const [propertyId, setPropertyId] = useState('');
  const [utilityType, setUtilityType] = useState<UtilityType | ''>('');

  // Meter setup
  const [meterDialogOpen, setMeterDialogOpen] = useState(false);
  const [newMeter, setNewMeter] = useState({
    property_id: '',
    utility_type: 'water' as UtilityType,
    meter_number: '',
    name: '',
    location: '',
    installed_on: isoDate(new Date()),
    add_initial_reading: false,
    initial_reading_value: '',
    initial_reading_date: isoDate(new Date()),
    is_shared: false,
    unit_id: '' as string,
    assigned_unit_ids: [] as string[],
  });

  // Bulk readings
  const [readingDate, setReadingDate] = useState<string>(isoDate(new Date()));
  const [readingInputs, setReadingInputs] = useState<
    Record<string, { reading_value: string; is_estimated: boolean; notes: string }>
  >({});

  // Tariffs
  const [tariffDialogOpen, setTariffDialogOpen] = useState(false);
  const [newTariff, setNewTariff] = useState({
    property_id: '',
    utility_type: 'water' as UtilityType,
    rate_per_unit: '0',
    fixed_charge: '0',
    currency: 'KES',
    effective_from: isoDate(new Date()),
    effective_to: '',
  });

  // Billing
  const [billingStart, setBillingStart] = useState<string>(() => {
    const d = new Date();
    return isoDate(new Date(d.getFullYear(), d.getMonth(), 1));
  });
  const [billingEnd, setBillingEnd] = useState<string>(isoDate(new Date()));
  const [billingDue, setBillingDue] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return isoDate(d);
  });
  const [createInvoices, setCreateInvoices] = useState(true);

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [details, setDetails] = useState<null | { severity: 'error' | 'warning' | 'info'; title: string; items: string[] }>(
    null
  );

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: propertyService.getAll,
  });

  const properties = (propertiesQuery.data ?? []) as Property[];

  useEffect(() => {
    if (!propertyId && properties.length > 0) {
      setPropertyId(properties[0].id);
      setNewTariff((prev) => ({ ...prev, property_id: properties[0].id }));
    }
  }, [propertyId, properties]);

  useEffect(() => {
    if (propertyId) {
      setNewMeter((prev) => ({
        ...prev,
        property_id: prev.property_id || propertyId,
      }));
    }
  }, [propertyId]);

  const unitsQuery = useQuery({
    queryKey: ['units', { propertyId }],
    enabled: !!propertyId,
    queryFn: async () => unitService.getByProperty(propertyId),
  });

  const units = (unitsQuery.data ?? []) as Unit[];

  const unitLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of units) {
      map.set(u.id, u.unit_number || (u as any).name || u.id.slice(0, 8));
    }
    return map;
  }, [units]);

  const metersQuery = useQuery({
    queryKey: ['utilities', 'meters', { propertyId }],
    enabled: !!propertyId,
    queryFn: async () => {
      const res = await utilityService.listMeters({
        property_id: propertyId,
        per_page: 200,
      });
      return res;
    },
  });

  const meterRows: Meter[] = useMemo(() => {
    const raw = metersQuery.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as Meter[];
    return (raw.data ?? raw?.meters?.data ?? []) as Meter[];
  }, [metersQuery.data]);

  const visibleMeters: Meter[] = useMemo(() => {
    if (!utilityType) return meterRows;
    return meterRows.filter((m) => m.utility_type === utilityType);
  }, [meterRows, utilityType]);

  const allocatedUnitIdsForNewMeter = useMemo(() => {
    const selectedUtility = newMeter.utility_type;
    const set = new Set<string>();

    for (const m of meterRows as any[]) {
      if (m?.utility_type !== selectedUtility) continue;

      if (m?.is_shared) {
        for (const uid of getAssignedUnitIds(m)) {
          set.add(uid);
        }
      } else if (m?.unit_id) {
        set.add(m.unit_id);
      }
    }

    return set;
  }, [meterRows, newMeter.utility_type]);

  const availableUnitsForNewMeter = useMemo(() => {
    return units.filter((u) => !allocatedUnitIdsForNewMeter.has(u.id));
  }, [units, allocatedUnitIdsForNewMeter]);

  useEffect(() => {
    // If user changes utility type, reset selections to avoid invalid picks.
    setNewMeter((p) => ({ ...p, unit_id: '', assigned_unit_ids: [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMeter.utility_type]);

  const createMeterMutation = useMutation({
    mutationFn: utilityService.createMeter,
    onSuccess: (data) => {
      setMeterDialogOpen(false);
      setError('');
      setSuccess('Meter created');
      setDetails(null);
      const created = (data as any)?.meter ?? data;
      const meterPropertyId = created?.property_id || propertyId;
      if (created?.id && meterPropertyId) {
        queryClient.setQueryData(['utilities', 'meters', { propertyId: meterPropertyId }], (old: any) => {
          if (!old) return [created];
          if (Array.isArray(old)) return [created, ...old.filter((m) => m.id !== created.id)];
          if (Array.isArray(old?.data)) {
            return { ...old, data: [created, ...old.data.filter((m: any) => m.id !== created.id)] };
          }
          if (Array.isArray(old?.meters?.data)) {
            return {
              ...old,
              meters: {
                ...old.meters,
                data: [created, ...old.meters.data.filter((m: any) => m.id !== created.id)],
              },
            };
          }
          return old;
        });
      }
      setNewMeter({
        property_id: propertyId,
        utility_type: utilityType || ('water' as UtilityType),
        meter_number: '',
        name: '',
        location: '',
        installed_on: isoDate(new Date()),
        add_initial_reading: false,
        initial_reading_value: '',
        initial_reading_date: isoDate(new Date()),
        is_shared: false,
        unit_id: '',
        assigned_unit_ids: [],
      });
      queryClient.invalidateQueries({ queryKey: ['utilities', 'meters', { propertyId }] });
    },
    onError: (e: any) => {
      setSuccess('');
      setDetails(null);
      const msg = e?.response?.data?.message || e?.message || 'Failed to create meter';
      setError(msg);
      if (e?.response?.status === 422 && e?.response?.data?.conflicts) {
        const conflicts = e.response.data.conflicts as Array<{ unit_id: string; utility_type: string }>;
        const items = conflicts.map((c) => {
          const unitName = unitLabelById.get(c.unit_id) || c.unit_id;
          return `${unitName} already has a ${c.utility_type} meter`;
        });
        setDetails({ severity: 'warning', title: 'Meter allocation conflicts', items });
      }
    },
  });

  const deleteMeterMutation = useMutation({
    mutationFn: utilityService.deleteMeter,
    onSuccess: () => {
      setError('');
      setSuccess('Meter deleted');
      queryClient.invalidateQueries({ queryKey: ['utilities', 'meters', { propertyId }] });
    },
    onError: (e: any) => {
      setSuccess('');
      setError(e?.response?.data?.message || e?.message || 'Failed to delete meter');
    },
  });

  useEffect(() => {
    if (!visibleMeters.length) return;
    setReadingInputs((prev) => {
      const next = { ...prev };
      for (const m of visibleMeters) {
        if (!next[m.id]) {
          next[m.id] = { reading_value: '', is_estimated: false, notes: '' };
        }
      }
      return next;
    });
  }, [visibleMeters]);

  const bulkSaveMutation = useMutation({
    mutationFn: utilityService.bulkSaveReadings,
    onSuccess: (data) => {
      setError('');
      setSuccess(`Saved ${data?.count ?? 0} readings`);
      setReadingInputs({});
      queryClient.invalidateQueries({ queryKey: ['utilities', 'meters', { propertyId }] });
      if (Array.isArray(data?.errors) && data.errors.length) {
        const items = (data.errors as any[]).map((er) => {
          const meterShort = String(er?.meter_id ?? '').slice(0, 8);
          const msg = er?.message || 'Validation warning';
          const when = er?.reading_date ? ` (${er.reading_date})` : '';
          return `${msg}${when} [meter ${meterShort}]`;
        });
        setDetails({ severity: 'warning', title: 'Some readings were skipped', items });
      } else {
        setDetails(null);
      }
    },
    onError: (e: any) => {
      setSuccess('');
      const msg = e?.response?.data?.message || e?.message || 'Failed to save readings';
      setError(msg);
      if (e?.response?.status === 422 && Array.isArray(e?.response?.data?.errors)) {
        const items = (e.response.data.errors as any[]).map((er) => {
          const meterShort = String(er?.meter_id ?? '').slice(0, 8);
          const msg2 = er?.message || 'Validation error';
          const when = er?.reading_date ? ` (${er.reading_date})` : '';
          return `${msg2}${when} [meter ${meterShort}]`;
        });
        setDetails({ severity: 'error', title: 'Reading validation errors', items });
      }
    },
  });

  const tariffsQuery = useQuery({
    queryKey: ['utilities', 'tariffs', { propertyId, utilityType }],
    enabled: !!propertyId,
    queryFn: async () => utilityService.listTariffs({ property_id: propertyId, utility_type: utilityType || undefined }),
  });

  const tariffRows: UtilityTariff[] = useMemo(() => {
    const raw = tariffsQuery.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as UtilityTariff[];
    return (raw.data ?? []) as UtilityTariff[];
  }, [tariffsQuery.data]);

  const createTariffMutation = useMutation({
    mutationFn: utilityService.createTariff,
    onSuccess: () => {
      setTariffDialogOpen(false);
      setError('');
      setSuccess('Tariff created');
      queryClient.invalidateQueries({ queryKey: ['utilities', 'tariffs'] });
    },
    onError: (e: any) => {
      setSuccess('');
      setError(e?.response?.data?.message || e?.message || 'Failed to create tariff');
    },
  });

  const runBillingMutation = useMutation({
    mutationFn: utilityService.runBilling,
    onSuccess: (data) => {
      setError('');
      const processedBills = data?.processed_bills ?? data?.created_bills ?? 0;
      const updatedBills = data?.updated_bills ?? 0;
      const processedInvoices = data?.processed_invoices ?? data?.created_invoices ?? 0;
      const createdBills = data?.created_bills ?? 0;
      const createdInvoices = data?.created_invoices ?? 0;

      setSuccess(
        `Billing run done: ${processedBills} bills (created ${createdBills}, updated ${updatedBills}), ${processedInvoices} invoices (created ${createdInvoices})`
      );
      if (Array.isArray(data?.warnings) && data.warnings.length) {
        const items = (data.warnings as any[]).map((w) => {
          const unitName = w?.unit_id ? unitLabelById.get(w.unit_id) || w.unit_id : null;
          const meterShort = w?.meter_id ? String(w.meter_id).slice(0, 8) : null;
          const prefix = [unitName, meterShort ? `meter ${meterShort}` : null].filter(Boolean).join(' • ');
          return prefix ? `${prefix}: ${w?.message}` : String(w?.message || 'Warning');
        });
        setDetails({ severity: 'warning', title: 'Billing warnings', items });
      } else {
        setDetails(null);
      }
    },
    onError: (e: any) => {
      setSuccess('');
      setError(e?.response?.data?.message || e?.message || 'Billing run failed');
      setDetails(null);
    },
  });

  const isLoading = propertiesQuery.isLoading || metersQuery.isLoading || unitsQuery.isLoading;

  const handleBulkSave = () => {
    setError('');
    setSuccess('');

    if (!propertyId) {
      setError('Select a property');
      return;
    }

    const readings = Object.entries(readingInputs)
      .map(([meter_id, v]) => ({
        meter_id,
        reading_value: Number(v.reading_value),
        is_estimated: v.is_estimated,
        notes: v.notes || undefined,
      }))
      .filter((r) => Number.isFinite(r.reading_value) && r.reading_value >= 0);

    if (readings.length === 0) {
      setError('Enter at least one reading value');
      return;
    }

    bulkSaveMutation.mutate({ property_id: propertyId, reading_date: readingDate, readings });
  };

  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4">Utilities</Typography>

        <Card sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel>Property</InputLabel>
              <Select
                label="Property"
                value={propertyId}
                onChange={(e) => setPropertyId(String(e.target.value))}
              >
                {properties.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Utility</InputLabel>
              <Select
                label="Utility"
                value={utilityType}
                onChange={(e) => setUtilityType((e.target.value as any) || '')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="water">Water</MenuItem>
                <MenuItem value="electricity">Electricity</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Card>

        {!!error && <Alert severity="error">{error}</Alert>}
        {!!success && <Alert severity="success">{success}</Alert>}
        {!!details && (
          <Alert severity={details.severity}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {details.title}
            </Typography>
            {details.items.slice(0, 8).map((it) => (
              <Typography key={it} variant="body2" sx={{ color: 'text.secondary' }}>
                - {it}
              </Typography>
            ))}
            {details.items.length > 8 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Showing 8 of {details.items.length}.
              </Typography>
            )}
          </Alert>
        )}
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Meters" />
        <Tab label="Bulk Readings" />
        <Tab label="Tariffs" />
        <Tab label="Billing Run" />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Meters
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setNewMeter((p) => ({
                  ...p,
                  property_id: propertyId,
                  utility_type: (utilityType || p.utility_type) as UtilityType,
                }));
                setMeterDialogOpen(true);
              }}
              disabled={!propertyId}
            >
              Add meter
            </Button>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Meter #</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell width={120}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleMeters.map((m) => {
                const unitLabel = m.is_shared
                  ? `Shared (${(m as any).assigned_units?.length ?? (m as any).assignedUnits?.length ?? 0} units)`
                  : (m as any).unit?.unit_number || (m as any).unit?.name || '-';

                return (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.name || '-'}</TableCell>
                    <TableCell>
                      <Label color={m.utility_type === 'water' ? 'info' : 'warning'}>{m.utility_type}</Label>
                    </TableCell>
                    <TableCell>{m.meter_number || '-'}</TableCell>
                    <TableCell>{unitLabel}</TableCell>
                    <TableCell>
                      <Label
                        color={m.status === 'active' ? 'success' : m.status === 'faulty' ? 'error' : 'default'}
                      >
                        {m.status}
                      </Label>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        disabled={deleteMeterMutation.isPending}
                        onClick={() => {
                          if (confirm('Delete this meter?')) {
                            deleteMeterMutation.mutate(m.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {visibleMeters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No meters yet. Add meters first, then enter readings.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Dialog open={meterDialogOpen} onClose={() => setMeterDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add Meter</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl size="small">
                  <InputLabel>Property</InputLabel>
                  <Select
                    label="Property"
                    value={propertyId}
                    onChange={(e) => {
                      const nextPropertyId = String(e.target.value);
                      setPropertyId(nextPropertyId);
                      setNewTariff((prev) => ({ ...prev, property_id: nextPropertyId }));
                      setNewMeter((p) => ({
                        ...p,
                        property_id: nextPropertyId,
                        unit_id: '',
                        assigned_unit_ids: [],
                      }));
                    }}
                  >
                    {properties.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Utility</InputLabel>
                  <Select
                    label="Utility"
                    value={newMeter.utility_type}
                    onChange={(e) => setNewMeter((p) => ({ ...p, utility_type: e.target.value as UtilityType }))}
                  >
                    <MenuItem value="water">Water</MenuItem>
                    <MenuItem value="electricity">Electricity</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Meter number (optional)"
                  size="small"
                  value={newMeter.meter_number}
                  onChange={(e) => setNewMeter((p) => ({ ...p, meter_number: e.target.value }))}
                />

                <TextField
                  label="Name (optional)"
                  size="small"
                  value={newMeter.name}
                  onChange={(e) => setNewMeter((p) => ({ ...p, name: e.target.value }))}
                />

                <TextField
                  label="Location (optional)"
                  size="small"
                  value={newMeter.location}
                  onChange={(e) => setNewMeter((p) => ({ ...p, location: e.target.value }))}
                />

                <TextField
                  label="Installed on (optional)"
                  type="date"
                  size="small"
                  value={newMeter.installed_on}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewMeter((p) => ({
                      ...p,
                      installed_on: v,
                      initial_reading_date: p.add_initial_reading ? (p.initial_reading_date || v) : p.initial_reading_date,
                    }));
                  }}
                  InputLabelProps={{ shrink: true }}
                />

                <FormControl size="small">
                  <InputLabel>Shared meter?</InputLabel>
                  <Select
                    label="Shared meter?"
                    value={newMeter.is_shared ? 'yes' : 'no'}
                    onChange={(e) =>
                      setNewMeter((p) => ({
                        ...p,
                        is_shared: e.target.value === 'yes',
                        unit_id: '',
                        assigned_unit_ids: [],
                      }))
                    }
                  >
                    <MenuItem value="no">No (per unit)</MenuItem>
                    <MenuItem value="yes">Yes (shared)</MenuItem>
                  </Select>
                </FormControl>

                {!newMeter.is_shared ? (
                  <FormControl size="small">
                    <InputLabel>Unit</InputLabel>
                    <Select
                      label="Unit"
                      value={newMeter.unit_id}
                      onChange={(e) => setNewMeter((p) => ({ ...p, unit_id: String(e.target.value) }))}
                    >
                      <MenuItem value="">Select unit</MenuItem>
                      {availableUnitsForNewMeter.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.unit_number}
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Units that already have a {newMeter.utility_type} meter are hidden.
                    </Typography>
                  </FormControl>
                ) : (
                  <FormControl size="small">
                    <InputLabel>Assigned units</InputLabel>
                    <Select
                      multiple
                      label="Assigned units"
                      value={newMeter.assigned_unit_ids}
                      onChange={(e) =>
                        setNewMeter((p) => ({
                          ...p,
                          assigned_unit_ids: (e.target.value as string[]) ?? [],
                        }))
                      }
                      renderValue={(selected) =>
                        units
                          .filter((u) => (selected as string[]).includes(u.id))
                          .map((u) => u.unit_number)
                          .join(', ')
                      }
                    >
                      {availableUnitsForNewMeter.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.unit_number}
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Units that already have a {newMeter.utility_type} meter are hidden.
                    </Typography>
                  </FormControl>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newMeter.add_initial_reading}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNewMeter((p) => ({
                          ...p,
                          add_initial_reading: checked,
                          initial_reading_date: checked ? (p.installed_on || p.initial_reading_date) : p.initial_reading_date,
                        }));
                      }}
                    />
                  }
                  label="Add start (initial) meter reading"
                />

                {newMeter.add_initial_reading && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Start reading date"
                      type="date"
                      size="small"
                      value={newMeter.initial_reading_date}
                      onChange={(e) => setNewMeter((p) => ({ ...p, initial_reading_date: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />

                    <TextField
                      label="Start reading"
                      type="number"
                      size="small"
                      value={newMeter.initial_reading_value}
                      onChange={(e) => setNewMeter((p) => ({ ...p, initial_reading_value: e.target.value }))}
                      inputProps={{ min: 0, step: '0.01' }}
                      sx={{ flex: 1 }}
                    />
                  </Stack>
                )}

                <Alert severity="info">
                  Tip: set a start reading when adding a new meter, then use Bulk Readings each month.
                </Alert>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setMeterDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                disabled={
                  createMeterMutation.isPending ||
                  !propertyId ||
                  (!newMeter.is_shared && !newMeter.unit_id) ||
                  (newMeter.is_shared && newMeter.assigned_unit_ids.length === 0)
                }
                onClick={() =>
                  createMeterMutation.mutate({
                    property_id: propertyId,
                    unit_id: newMeter.is_shared ? null : newMeter.unit_id,
                    utility_type: newMeter.utility_type,
                    meter_number: newMeter.meter_number || null,
                    name: newMeter.name || null,
                    location: newMeter.location || null,
                    is_shared: newMeter.is_shared,
                    installed_on: newMeter.installed_on || null,
                    assigned_unit_ids: newMeter.is_shared ? newMeter.assigned_unit_ids : undefined,
                    initial_reading_value:
                      newMeter.add_initial_reading && newMeter.initial_reading_value !== ''
                        ? Number(newMeter.initial_reading_value)
                        : undefined,
                    initial_reading_date:
                      newMeter.add_initial_reading
                        ? newMeter.initial_reading_date || newMeter.installed_on || isoDate(new Date())
                        : undefined,
                  })
                }
              >
                {createMeterMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
        </Card>
      )}

      {tab === 1 && (
        <Card sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
            <TextField
              label="Reading date"
              type="date"
              size="small"
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 220 }}
            />

            <Box sx={{ flex: 1 }} />

            {visibleMeters.length === 0 && (
              <Button variant="outlined" onClick={() => setMeterDialogOpen(true)} disabled={!propertyId}>
                Add meter first
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleBulkSave}
              disabled={bulkSaveMutation.isPending || !propertyId}
            >
              {bulkSaveMutation.isPending ? 'Saving…' : 'Save readings'}
            </Button>
          </Stack>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Meter</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Prev reading</TableCell>
                  <TableCell width={200}>New reading</TableCell>
                  <TableCell width={140}>Estimated</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleMeters.map((m) => {
                  const latest = getLatestReading(m);
                  const input = readingInputs[m.id] ?? { reading_value: '', is_estimated: false, notes: '' };
                  const unitLabel = m.is_shared
                    ? `Shared (${(m as any).assigned_units?.length ?? (m as any).assignedUnits?.length ?? 0} units)`
                    : (m as any).unit?.unit_number || (m as any).unit?.name || '-';

                  return (
                    <TableRow key={m.id} hover>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2">{m.name || m.meter_number || m.id.slice(0, 8)}</Typography>
                          {!!m.meter_number && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              #{m.meter_number}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Label color={m.utility_type === 'water' ? 'info' : 'warning'}>{m.utility_type}</Label>
                      </TableCell>
                      <TableCell>{unitLabel}</TableCell>
                      <TableCell>
                        {latest ? (
                          <Stack spacing={0.5}>
                            <Typography variant="body2">{formatNumber(latest.reading_value)}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {latest.reading_date}
                              {latest.is_estimated ? ' (est.)' : ''}
                            </Typography>
                          </Stack>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={input.reading_value}
                          onChange={(e) =>
                            setReadingInputs((prev) => ({
                              ...prev,
                              [m.id]: { ...input, reading_value: e.target.value },
                            }))
                          }
                          inputProps={{ min: 0, step: '0.01' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={input.is_estimated ? 'yes' : 'no'}
                          onChange={(e) =>
                            setReadingInputs((prev) => ({
                              ...prev,
                              [m.id]: { ...input, is_estimated: e.target.value === 'yes' },
                            }))
                          }
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={input.notes}
                          onChange={(e) =>
                            setReadingInputs((prev) => ({
                              ...prev,
                              [m.id]: { ...input, notes: e.target.value },
                            }))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {visibleMeters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No meters found for this property.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Tariffs
            </Typography>
            <Button variant="outlined" onClick={() => setTariffDialogOpen(true)} disabled={!propertyId}>
              Add tariff
            </Button>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Utility</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Fixed</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Effective</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tariffRows.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Label color={t.utility_type === 'water' ? 'info' : 'warning'}>{t.utility_type}</Label>
                  </TableCell>
                  <TableCell>{formatNumber(t.rate_per_unit)}</TableCell>
                  <TableCell>{formatNumber(t.fixed_charge)}</TableCell>
                  <TableCell>{t.currency}</TableCell>
                  <TableCell>
                    {t.effective_from}
                    {t.effective_to ? ` → ${t.effective_to}` : ''}
                  </TableCell>
                </TableRow>
              ))}
              {tariffRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No tariffs yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Dialog open={tariffDialogOpen} onClose={() => setTariffDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add Tariff</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl size="small">
                  <InputLabel>Utility</InputLabel>
                  <Select
                    label="Utility"
                    value={newTariff.utility_type}
                    onChange={(e) => setNewTariff((p) => ({ ...p, utility_type: e.target.value as UtilityType }))}
                  >
                    <MenuItem value="water">Water</MenuItem>
                    <MenuItem value="electricity">Electricity</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Rate per unit"
                  size="small"
                  type="number"
                  value={newTariff.rate_per_unit}
                  onChange={(e) => setNewTariff((p) => ({ ...p, rate_per_unit: e.target.value }))}
                />

                <TextField
                  label="Fixed charge"
                  size="small"
                  type="number"
                  value={newTariff.fixed_charge}
                  onChange={(e) => setNewTariff((p) => ({ ...p, fixed_charge: e.target.value }))}
                />

                <TextField
                  label="Currency"
                  size="small"
                  value={newTariff.currency}
                  onChange={(e) => setNewTariff((p) => ({ ...p, currency: e.target.value }))}
                />

                <TextField
                  label="Effective from"
                  size="small"
                  type="date"
                  value={newTariff.effective_from}
                  onChange={(e) => setNewTariff((p) => ({ ...p, effective_from: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Effective to (optional)"
                  size="small"
                  type="date"
                  value={newTariff.effective_to}
                  onChange={(e) => setNewTariff((p) => ({ ...p, effective_to: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTariffDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                disabled={createTariffMutation.isPending || !propertyId}
                onClick={() =>
                  createTariffMutation.mutate({
                    property_id: propertyId,
                    utility_type: newTariff.utility_type,
                    rate_per_unit: Number(newTariff.rate_per_unit),
                    fixed_charge: Number(newTariff.fixed_charge),
                    currency: newTariff.currency,
                    effective_from: newTariff.effective_from,
                    effective_to: newTariff.effective_to || null,
                  })
                }
              >
                {createTariffMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
        </Card>
      )}

      {tab === 3 && (
        <Card sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Run Billing</Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Start date"
                type="date"
                size="small"
                value={billingStart}
                onChange={(e) => setBillingStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 220 }}
              />
              <TextField
                label="End date"
                type="date"
                size="small"
                value={billingEnd}
                onChange={(e) => setBillingEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 220 }}
              />
              <TextField
                label="Due date"
                type="date"
                size="small"
                value={billingDue}
                onChange={(e) => setBillingDue(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 220 }}
              />
            </Stack>

            <FormControl size="small" sx={{ width: 240 }}>
              <InputLabel>Create invoices</InputLabel>
              <Select
                label="Create invoices"
                value={createInvoices ? 'yes' : 'no'}
                onChange={(e) => setCreateInvoices(e.target.value === 'yes')}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No (draft bills only)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              disabled={runBillingMutation.isPending || !propertyId}
              onClick={() =>
                runBillingMutation.mutate({
                  start_date: billingStart,
                  end_date: billingEnd,
                  due_date: billingDue,
                  property_id: propertyId,
                  utility_type: utilityType || undefined,
                  create_invoices: createInvoices,
                })
              }
              sx={{ width: 220 }}
            >
              {runBillingMutation.isPending ? 'Running…' : 'Run billing'}
            </Button>

            <Alert severity="info">
              Billing uses the latest reading on/before the start and end dates. If readings are missing, the run will complete with warnings.
            </Alert>
          </Stack>
        </Card>
      )}
    </Box>
  );
}
