import api from './api';

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  type: 'studio' | '1br' | '2br' | '3br' | '4br' | 'shop' | 'office' | 'other';
  bedrooms: number;
  bathrooms: number;
  square_meters?: number;
  floor?: string;
  rent_amount: number;
  deposit_amount: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  features?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    name: string;
    organization: {
      id: string;
      name: string;
    };
  };
}

export interface UnitStats {
  total_units: number;
  vacant_units: number;
  occupied_units: number;
  maintenance_units: number;
  reserved_units: number;
  units_by_type: Record<string, number>;
  occupancy_rate: number;
  average_rent: number;
}

export interface CreateUnitRequest {
  property_id: string;
  unit_number: string;
  type: 'studio' | '1br' | '2br' | '3br' | '4br' | 'shop' | 'office' | 'other';
  bedrooms?: number;
  bathrooms?: number;
  square_meters?: number;
  floor?: string;
  rent_amount: number;
  deposit_amount?: number;
  description?: string;
  features?: any;
  metadata?: any;
}

export interface UpdateUnitRequest {
  property_id?: string;
  unit_number?: string;
  type?: 'studio' | '1br' | '2br' | '3br' | '4br' | 'shop' | 'office' | 'other';
  bedrooms?: number;
  bathrooms?: number;
  square_meters?: number;
  floor?: string;
  rent_amount?: number;
  deposit_amount?: number;
  status?: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  features?: any;
  metadata?: any;
}

interface GetUnitsParams {
  property_id?: string;
  organization_id?: string;
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

const unitManagementService = {
  // Get all units
  getUnits: async (params?: GetUnitsParams) => {
    const response = await api.get('/admin/units', { params });
    return response.data;
  },

  // Get unit statistics
  getStats: async (): Promise<UnitStats> => {
    const response = await api.get('/admin/units/stats');
    return response.data;
  },

  // Get a specific unit
  getUnit: async (id: string): Promise<Unit> => {
    const response = await api.get(`/admin/units/${id}`);
    return response.data;
  },

  // Create a unit
  createUnit: async (data: CreateUnitRequest): Promise<Unit> => {
    const response = await api.post('/admin/units', data);
    return response.data.unit;
  },

  // Update a unit
  updateUnit: async (id: string, data: UpdateUnitRequest): Promise<Unit> => {
    const response = await api.put(`/admin/units/${id}`, data);
    return response.data.unit;
  },

  // Delete a unit
  deleteUnit: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/units/${id}`);
    return response.data;
  },
};

export default unitManagementService;
