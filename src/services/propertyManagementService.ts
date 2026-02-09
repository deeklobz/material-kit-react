import api from './api';

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  code?: string;
  description?: string;
  type: 'residential' | 'commercial' | 'mixed';
  address: string;
  city: string;
  county: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  total_units: number;
  occupied_units: number;
  amenities?: any;
  metadata?: any;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface PropertyStats {
  total_properties: number;
  active_properties: number;
  inactive_properties: number;
  properties_by_type: Record<string, number>;
  total_units: number;
  total_occupied_units: number;
  average_occupancy_rate: number;
}

export interface CreatePropertyRequest {
  organization_id: string;
  name: string;
  code?: string;
  type: 'residential' | 'commercial' | 'mixed';
  address: string;
  city: string;
  county: string;
  postal_code?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  total_units?: number;
  amenities?: any;
  metadata?: any;
}

export interface UpdatePropertyRequest {
  organization_id?: string;
  name?: string;
  code?: string;
  type?: 'residential' | 'commercial' | 'mixed';
  address?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  total_units?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  amenities?: any;
  metadata?: any;
}

interface GetPropertiesParams {
  organization_id?: string;
  type?: string;
  status?: string;
  search?: string;
  page?: number;
}

const propertyManagementService = {
  // Get all properties
  getProperties: async (params?: GetPropertiesParams) => {
    const response = await api.get('/admin/properties', { params });
    return response.data;
  },

  // Get property statistics
  getStats: async (): Promise<PropertyStats> => {
    const response = await api.get('/admin/properties/stats');
    return response.data;
  },

  // Get a specific property
  getProperty: async (id: string): Promise<Property> => {
    const response = await api.get(`/admin/properties/${id}`);
    return response.data;
  },

  // Create a property
  createProperty: async (data: CreatePropertyRequest): Promise<Property> => {
    const response = await api.post('/admin/properties', data);
    return response.data.property;
  },

  // Update a property
  updateProperty: async (id: string, data: UpdatePropertyRequest): Promise<Property> => {
    const response = await api.put(`/admin/properties/${id}`, data);
    return response.data.property;
  },

  // Delete a property
  deleteProperty: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/properties/${id}`);
    return response.data;
  },
};

export default propertyManagementService;
