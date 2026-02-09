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

export const tenantService = {
  getAll: async (): Promise<Tenant[]> => {
    const { data } = await api.get('/tenants');
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
    await api.delete(`/tenants/${id}`);
  },

  vacate: async (tenantId: string, payload: { lease_id?: string; termination_date: string; termination_reason?: string; }) => {
    const { data } = await api.post(`/tenants/${tenantId}/vacate`, payload);
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
};
