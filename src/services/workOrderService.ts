import api from './api';

// ----------------------------------------------------------------------

export type WorkOrderCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliance'
  | 'structural'
  | 'pest_control'
  | 'general'
  | 'other';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type WorkOrderStatus = 'open' | 'in_progress' | 'on_hold' | 'completed' | 'canceled';

export interface WorkOrderUpdate {
  id: string;
  work_order_id: string;
  user_id: string;
  comment?: string | null;
  old_status?: WorkOrderStatus | null;
  new_status?: WorkOrderStatus | null;
  attachments?: any[] | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface WorkOrder {
  id: string;
  organization_id: string;
  property_id: string;
  unit_id?: string | null;
  tenant_id?: string | null;
  assigned_to?: string | null;
  vendor_id?: string | null;
  ticket_number: string;
  title: string;
  description: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  estimated_cost?: string | number | null;
  actual_cost?: string | number | null;
  scheduled_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;

  property?: { id: string; name: string; code?: string };
  unit?: { id: string; unit_number: string };
  assigned_to_user?: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  vendor?: { id: string; name: string };
  updates?: WorkOrderUpdate[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface WorkOrderStats {
  by_status: Record<WorkOrderStatus, number>;
  overdue_scheduled: number;
  urgent_open: number;
  avg_open_days: number;
  expenses: {
    actual_total: number;
    actual_completed: number;
    estimated_open: number;
    spent_completed: number;
    committed_open: number;
    total: number;
  };
}

export interface WorkOrderListParams {
  property_id?: string;
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  category?: WorkOrderCategory;
  page?: number; // 1-based (Laravel)
  per_page?: number;
}

export interface WorkOrderStatsParams {
  property_id?: string;
}

export interface WorkOrderCreateData {
  property_id: string;
  unit_id?: string;
  title: string;
  description: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  status?: WorkOrderStatus;
  assigned_to?: string;
  vendor_id?: string;
  scheduled_date?: string; // YYYY-MM-DD
  estimated_cost?: number;
}

export interface WorkOrderUpdateData {
  title?: string;
  description?: string;
  category?: WorkOrderCategory;
  priority?: WorkOrderPriority;
  status?: WorkOrderStatus;
  assigned_to?: string | null;
  vendor_id?: string | null;
  scheduled_date?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
}

export interface WorkOrderAddUpdateData {
  comment: string;
  new_status?: WorkOrderStatus;
  attachments?: any[];
}

export const workOrderService = {
  getStats: async (params?: WorkOrderStatsParams): Promise<WorkOrderStats> => {
    const { data } = await api.get('/work-orders/stats', { params });
    return data;
  },

  getAll: async (params?: WorkOrderListParams): Promise<PaginatedResponse<WorkOrder>> => {
    const { data } = await api.get('/work-orders', { params });
    return data;
  },

  getById: async (id: string): Promise<WorkOrder> => {
    const { data } = await api.get(`/work-orders/${id}`);
    return data.data || data.work_order || data;
  },

  create: async (payload: WorkOrderCreateData): Promise<WorkOrder> => {
    const { data } = await api.post('/work-orders', payload);
    return data.work_order || data.data || data;
  },

  update: async (id: string, payload: WorkOrderUpdateData): Promise<WorkOrder> => {
    const { data } = await api.put(`/work-orders/${id}`, payload);
    return data.work_order || data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/work-orders/${id}`);
  },

  addUpdate: async (
    id: string,
    payload: WorkOrderAddUpdateData | FormData
  ): Promise<{ update: WorkOrderUpdate; work_order: WorkOrder }> => {
    const { data } = await api.post(`/work-orders/${id}/updates`, payload);
    return data;
  },
};
