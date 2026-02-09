import api from './api';

// ----------------------------------------------------------------------

export interface Property {
  id: string;
  name: string;
  code: string;
  type: 'residential' | 'commercial' | 'mixed';
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
  total_units: number;
  occupied_units?: number;
  status: 'active' | 'inactive' | 'maintenance';
  subscription_plan_id?: string;
  subscription_status?: string;
  next_billing_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyFormData {
  name: string;
  code: string;
  type: 'residential' | 'commercial' | 'mixed';
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
  total_units: number;
  status: 'active' | 'inactive' | 'maintenance';
  description?: string;
}

export const propertyService = {
  getAll: async (): Promise<Property[]> => {
    const { data } = await api.get('/properties');
    return data.data || data;
  },

  getById: async (id: string): Promise<Property> => {
    const { data } = await api.get(`/properties/${id}`);
    return data.data || data;
  },

  create: async (propertyData: PropertyFormData): Promise<Property> => {
    const { data } = await api.post('/properties', propertyData);
    return data.data || data;
  },

  update: async (id: string, propertyData: Partial<PropertyFormData>): Promise<Property> => {
    const { data } = await api.put(`/properties/${id}`, propertyData);
    return data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },
};
