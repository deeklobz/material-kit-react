import api from './api';

// ----------------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  subscription_plan?: string;
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled';
  trial_ends_at?: string;
  properties_count?: number;
  users_count?: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface OrganizationFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export const organizationService = {
  getAll: async (): Promise<Organization[]> => {
    const { data } = await api.get('/admin/organizations', { params: { per_page: 1000 } });
    return data.data || data;
  },

  getOrganizations: async (params?: any) => {
    const { data } = await api.get('/admin/organizations', { params });
    return data;
  },

  getById: async (id: string): Promise<Organization> => {
    const { data } = await api.get(`/admin/organizations/${id}`);
    return data.data || data;
  },

  create: async (orgData: OrganizationFormData): Promise<Organization> => {
    const { data } = await api.post('/admin/organizations', orgData);
    return data.data || data;
  },

  update: async (id: string, orgData: Partial<OrganizationFormData>): Promise<Organization> => {
    const { data } = await api.put(`/admin/organizations/${id}`, orgData);
    return data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/organizations/${id}`);
  },

  suspend: async (id: string): Promise<Organization> => {
    const { data } = await api.post(`/admin/organizations/${id}/suspend`);
    return data.data || data;
  },

  activate: async (id: string): Promise<Organization> => {
    const { data } = await api.post(`/admin/organizations/${id}/activate`);
    return data.data || data;
  },
};

export default organizationService;
