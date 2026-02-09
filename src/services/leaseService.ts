import api from './api';

export interface LeaseFormData {
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  payment_day: number;
  lease_terms?: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
}

export interface Lease {
  id: string;
  lease_number: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  rent_day: number;
  billing_cycle: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  termination_date?: string;
  termination_reason?: string;
  terms?: string;
  unit?: {
    id: string;
    unit_number: string;
    bedrooms?: number;
    property?: {
      id: string;
      name: string;
      address?: string;
      organization?: {
        name?: string;
        email?: string;
      };
    };
  };
  tenant?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    id_number?: string;
  };
}

interface GetLeasesParams {
  status?: string;
  unit_id?: string;
  tenant_id?: string;
  property_id?: string;
  page?: number;
  per_page?: number;
}

export const leaseService = {
  getAll: async (params?: GetLeasesParams) => {
    const response = await api.get('/leases', { params });
    return response.data;
  },

  create: async (data: LeaseFormData) => {
    const response = await api.post('/leases', data);
    return response.data.lease || response.data.data || response.data;
  },

  update: async (id: string, data: Partial<LeaseFormData>) => {
    const response = await api.put(`/leases/${id}`, data);
    return response.data.lease || response.data.data || response.data;
  },

  terminate: async (id: string, payload: { termination_date: string; termination_reason?: string }) => {
    const response = await api.put(`/leases/${id}`, {
      status: 'terminated',
      termination_date: payload.termination_date,
      termination_reason: payload.termination_reason,
    });
    return response.data.lease || response.data.data || response.data;
  },
};
