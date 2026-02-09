import api from './api';

export interface AuditLog {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  action: 'created' | 'updated' | 'deleted' | 'login' | 'logout';
  model: string | null;
  model_id: number | null;
  description: string;
  ip_address: string;
  user_agent: string;
  changes: any;
  created_at: string;
}

export interface AuditLogStats {
  total_logs: number;
  logs_today: number;
  logs_this_week: number;
  logs_this_month: number;
  actions_by_type: Record<string, number>;
  most_active_users: Array<{
    name: string;
    actions: number;
  }>;
}

interface GetLogsParams {
  action?: string;
  user_id?: number;
  model?: string;
  page?: number;
  per_page?: number;
}

const auditLogService = {
  // Get audit logs
  getLogs: async (params?: GetLogsParams) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  // Get audit log statistics
  getStats: async (): Promise<AuditLogStats> => {
    const response = await api.get('/admin/audit-logs/stats');
    return response.data;
  },

  // Export audit logs
  exportLogs: async (format: 'csv' | 'pdf' | 'excel'): Promise<any> => {
    const response = await api.get('/admin/audit-logs/export', {
      params: { format },
    });
    return response.data;
  },
};

export default auditLogService;
