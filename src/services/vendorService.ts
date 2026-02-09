import api from './api';

// ----------------------------------------------------------------------

export interface Vendor {
  id: string;
  name: string;
  category:
    | 'plumbing'
    | 'electrical'
    | 'hvac'
    | 'carpentry'
    | 'painting'
    | 'cleaning'
    | 'pest_control'
    | 'landscaping'
    | 'security'
    | 'general';
  contact_person?: string | null;
  email: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  tax_id?: string | null;
  license_number?: string | null;
  rating?: number | null;
  status: 'active' | 'inactive' | 'blacklisted';
  created_at?: string;
  updated_at?: string;
}

export interface VendorFormData {
  name: string;
  category: Vendor['category'];
  contact_person?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  tax_id?: string;
  license_number?: string;
  rating?: number;
  status: Vendor['status'];
}

type PaginatedResponse<T> = {
  data: T[];
  total?: number;
  per_page?: number;
  current_page?: number;
};

export const vendorService = {
  getAll: async (params?: { category?: string; status?: string; search?: string }): Promise<Vendor[] | PaginatedResponse<Vendor>> => {
    const { data } = await api.get('/vendors', { params });
    return data;
  },

  getById: async (id: string): Promise<Vendor> => {
    const { data } = await api.get(`/vendors/${id}`);
    return data.data || data.vendor || data;
  },

  create: async (payload: VendorFormData): Promise<Vendor> => {
    const { data } = await api.post('/vendors', payload);
    return data.vendor || data.data || data;
  },

  update: async (id: string, payload: Partial<VendorFormData>): Promise<Vendor> => {
    const { data } = await api.put(`/vendors/${id}`, payload);
    return data.vendor || data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`);
  },
};
