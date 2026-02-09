import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import InfoIcon from '@mui/icons-material/Info';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Button,
  Dialog,
  Tooltip,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
} from '@mui/material';

import auditLogService from '../../services/auditLogService';

import type { AuditLog } from '../../services/auditLogService';

export default function AuditLogsView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [filterAction, setFilterAction] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: logsData } = useQuery({
    queryKey: ['audit-logs', page, filterAction, filterModel],
    queryFn: () =>
      auditLogService.getLogs({
        page: page + 1,
        per_page: rowsPerPage,
        action: filterAction || undefined,
        model: filterModel || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['audit-log-stats'],
    queryFn: auditLogService.getStats,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const result = await auditLogService.exportLogs(format);
      alert(result.message);
    } catch (error) {
      alert('Export failed');
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'deleted':
        return 'error';
      case 'login':
        return 'primary';
      default:
        return 'default';
    }
  };

  const logs = logsData?.data || [];
  const totalLogs = logsData?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Audit Logs</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('csv')}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('excel')}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            PDF
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Total Logs
            </Typography>
            <Typography variant="h4">{stats.total_logs}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Logs Today
            </Typography>
            <Typography variant="h4">{stats.logs_today}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              This Week
            </Typography>
            <Typography variant="h4">{stats.logs_this_week}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              This Month
            </Typography>
            <Typography variant="h4">{stats.logs_this_month}</Typography>
          </Card>
        </Box>
      )}

      {/* Action Types Summary */}
      {stats && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Actions by Type
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {Object.entries(stats.actions_by_type).map(([action, count]) => (
              <Chip
                key={action}
                label={`${action}: ${count}`}
                color={getActionColor(action) as any}
                variant="outlined"
              />
            ))}
          </Box>
        </Card>
      )}

      {/* Most Active Users */}
      {stats && stats.most_active_users.length > 0 && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Most Active Users
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {stats.most_active_users.map((user, index) => (
              <Card key={index} sx={{ flex: 1, p: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="body2">{user.name}</Typography>
                <Typography variant="h5">{user.actions} actions</Typography>
              </Card>
            ))}
          </Box>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Action"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Actions</MenuItem>
            <MenuItem value="created">Created</MenuItem>
            <MenuItem value="updated">Updated</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
            <MenuItem value="login">Login</MenuItem>
            <MenuItem value="logout">Logout</MenuItem>
          </TextField>
          <TextField
            select
            label="Model"
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Models</MenuItem>
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Organization">Organization</MenuItem>
            <MenuItem value="SubscriptionPlan">Subscription Plan</MenuItem>
            <MenuItem value="Property">Property</MenuItem>
            <MenuItem value="Tenant">Tenant</MenuItem>
          </TextField>
        </Box>
      </Card>

      {/* Logs Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log: AuditLog) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{log.user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={getActionColor(log.action) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.model || '-'}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>
                    <Typography variant="caption">{log.ip_address}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(log)}>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[15]}
        />
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body1">
                  {selectedLog.user.name} ({selectedLog.user.email})
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Action
                </Typography>
                <Typography variant="body1">
                  <Chip
                    label={selectedLog.action}
                    color={getActionColor(selectedLog.action) as any}
                    size="small"
                  />
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Model
                </Typography>
                <Typography variant="body1">
                  {selectedLog.model || '-'} {selectedLog.model_id && `(ID: ${selectedLog.model_id})`}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{selectedLog.description}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  IP Address
                </Typography>
                <Typography variant="body1">{selectedLog.ip_address}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  User Agent
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {selectedLog.user_agent}
                </Typography>
              </Box>
              {selectedLog.changes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Changes
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.875rem',
                    }}
                  >
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
