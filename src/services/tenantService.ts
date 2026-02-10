import api from './api';

// ----------------------------------------------------------------------

export interface Tenant {
  id: string;
  tenant_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number?: string;
  date_of_birth?: string;
  occupation?: string;
  employer?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'active' | 'inactive' | 'blacklisted' | 'suspended';
  move_in_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantDetail extends Tenant {
  leases?: any[];
  currentLease?: any;
  invoices?: any[];
  payments?: any[];
  violations?: any[];
  ratings?: any[];
  deposit_refunds?: any[];
}

export interface TenantFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number?: string;
  date_of_birth?: string;
  occupation?: string;
  employer?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'active' | 'inactive' | 'blacklisted' | 'suspended';
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  from?: number;
  to?: number;
  links?: any;
  meta?: any;
}

export interface TenantFinancialsResponse {
  tenant: { id: string; name: string; email?: string; phone?: string; status?: string };
  current_lease?: any;
  summary: {
    period: { start_date: string; end_date: string };
    totals: {
      total_invoiced: number;
      total_paid: number;
      total_credits?: number;
      balance_due: number;
      overdue_due: number;
      open_invoices: number;
      invoices_count: number;
      payments_count: number;
      last_payment_date?: string | null;
    };
  };
  invoices: any[];
  payments: any[];
}

export const tenantService = {
  // Returns a simple array (best for dropdowns).
  getAll: async (): Promise<Tenant[]> => {
    const { data } = await api.get('/tenants', { params: { per_page: 200 } });
    if (Array.isArray(data)) return data as Tenant[];
    if (Array.isArray((data as any)?.data)) return (data as any).data as Tenant[];
    return (data as any)?.data?.data ?? [];
  },

  // Returns the full paginator payload (for the tenants list screen).
  list: async (params?: { page?: number; per_page?: number; search?: string; status?: string }): Promise<PaginatedResponse<Tenant>> => {
    const { data } = await api.get('/tenants', { params });
    return data;
  },

  getById: async (id: string): Promise<TenantDetail> => {
    const { data } = await api.get(`/tenants/${id}`);
    return data.data || data;
  },

  create: async (tenantData: TenantFormData): Promise<Tenant> => {
    const { data } = await api.post('/tenants', tenantData);
    return data.tenant || data.data || data;
  },

  update: async (id: string, tenantData: Partial<TenantFormData>): Promise<Tenant> => {
    const { data } = await api.put(`/tenants/${id}`, tenantData);
    return data.tenant || data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.post(`/tenants/${id}/archive`);
  },

  deletePermanent: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  },

  vacate: async (tenantId: string, payload: { lease_id?: string; termination_date: string; termination_reason?: string; }) => {
    const { data } = await api.post(`/tenants/${tenantId}/vacate`, payload);
    return data;
  },

  relocate: async (
    tenantId: string,
    payload: {
      unit_id: string;
      relocation_date: string;
      end_date?: string;
      termination_reason?: string;
      refund_excess?: boolean;
      rent_amount?: number;
      deposit_amount?: number;
      rent_day?: number;
      billing_cycle?: 'monthly' | 'quarterly' | 'yearly';
      terms?: any;
    }
  ) => {
    const { data } = await api.post(`/tenants/${tenantId}/relocate`, payload);
    return data;
  },

  refundDeposit: async (tenantId: string, payload: { lease_id: string; deposit_amount: number; deductions?: number; refund_date: string; notes?: string; }) => {
    const { data } = await api.post(`/tenants/${tenantId}/refund-deposit`, payload);
    return data;
  },

  rate: async (tenantId: string, payload: { rating: number; notes?: string; rated_at?: string; }) => {
    const { data } = await api.post(`/tenants/${tenantId}/rate`, payload);
    return data;
  },

  addViolation: async (tenantId: string, payload: { title: string; description?: string; severity?: 'low' | 'medium' | 'high'; reported_at?: string; status?: 'open' | 'resolved'; resolution_notes?: string; }) => {
    const { data } = await api.post(`/tenants/${tenantId}/violations`, payload);
    return data;
  },

  getFinancials: async (tenantId: string, params?: { start_date?: string; end_date?: string }): Promise<TenantFinancialsResponse> => {
    const { data } = await api.get(`/tenants/${tenantId}/financials`, { params });
    return data;
  },

  downloadFinancialsPdf: async (tenantId: string, params?: { start_date?: string; end_date?: string }): Promise<Blob> => {
    const res = await api.get(`/tenants/${tenantId}/financials/pdf`, {
      params,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
    return res.data as Blob;
  },
};
