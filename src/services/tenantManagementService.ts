import api from './api';

export interface TenantData {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'active' | 'inactive' | 'blacklisted';
  metadata?: any;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface TenantStats {
  total_tenants: number;
  active_tenants: number;
  inactive_tenants: number;
  blacklisted_tenants: number;
  new_tenants_this_month: number;
}

export interface CreateTenantRequest {
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  metadata?: any;
}

export interface UpdateTenantRequest {
  organization_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  id_number?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status?: 'active' | 'inactive' | 'blacklisted';
  metadata?: any;
}

interface GetTenantsParams {
  organization_id?: string;
  status?: string;
  search?: string;
  page?: number;
}

const tenantManagementService = {
  // Get all tenants
  getTenants: async (params?: GetTenantsParams) => {
    const response = await api.get('/admin/tenants', { params });
    return response.data;
  },

  // Get tenant statistics
  getStats: async (): Promise<TenantStats> => {
    const response = await api.get('/admin/tenants/stats');
    return response.data;
  },

  // Get a specific tenant
  getTenant: async (id: string): Promise<TenantData> => {
    const response = await api.get(`/admin/tenants/${id}`);
    return response.data;
  },

  // Create a tenant
  createTenant: async (data: CreateTenantRequest): Promise<TenantData> => {
    const response = await api.post('/admin/tenants', data);
    return response.data.tenant;
  },

  // Update a tenant
  updateTenant: async (id: string, data: UpdateTenantRequest): Promise<TenantData> => {
    const response = await api.put(`/admin/tenants/${id}`, data);
    return response.data.tenant;
  },

  // Delete a tenant
  deleteTenant: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/tenants/${id}`);
    return response.data;
  },

  // Blacklist a tenant
  blacklistTenant: async (id: string): Promise<any> => {
    const response = await api.post(`/admin/tenants/${id}/blacklist`);
    return response.data;
  },

  // Activate a tenant
  activateTenant: async (id: string): Promise<any> => {
    const response = await api.post(`/admin/tenants/${id}/activate`);
    return response.data;
  },
};

export default tenantManagementService;
