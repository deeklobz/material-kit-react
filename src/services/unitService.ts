import api from './api';

// ----------------------------------------------------------------------

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  rent_amount: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  property?: {
    id: string;
    name: string;
    code: string;
  };
  current_tenant?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UnitFormData {
  property_id: string;
  unit_number: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  rent_amount: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
}

export const unitService = {
  getAll: async (params?: { property_id?: string; status?: string; search?: string }): Promise<Unit[]> => {
    const { data } = await api.get('/units', { params });
    return data.data || data;
  },

  getById: async (id: string): Promise<Unit> => {
    const { data } = await api.get(`/units/${id}`);
    return data.data || data;
  },

  getByProperty: async (propertyId: string): Promise<Unit[]> => {
    const { data } = await api.get(`/properties/${propertyId}/units`);
    return data.data || data;
  },

  create: async (unitData: UnitFormData): Promise<Unit> => {
    const { data } = await api.post('/units', unitData);
    return data.data || data;
  },

  update: async (id: string, unitData: Partial<UnitFormData>): Promise<Unit> => {
    const { data } = await api.put(`/units/${id}`, unitData);
    return data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`);
  },
};
