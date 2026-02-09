import api from './api';

export type ChargeScope = 'property' | 'unit';
export type ChargeBillingType = 'one_time' | 'recurring';
export type ChargeFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type ChargeStatus = 'active' | 'inactive';

export interface AdditionalCharge {
  id: string;
  organization_id: string;
  property_id?: string | null;
  unit_id?: string | null;
  name: string;
  description?: string | null;
  amount: number;
  billing_type: ChargeBillingType;
  frequency?: ChargeFrequency | null;
  start_date?: string | null;
  end_date?: string | null;
  status: ChargeStatus;
  scope: ChargeScope;
  property?: { id: string; name: string };
  unit?: { id: string; unit_number: string };
  created_at: string;
  updated_at: string;
}

export interface CreateAdditionalChargeRequest {
  scope: ChargeScope;
  property_id?: string;
  unit_id?: string;
  name: string;
  description?: string;
  amount: number;
  billing_type: ChargeBillingType;
  frequency?: ChargeFrequency;
  start_date?: string;
  end_date?: string;
  status?: ChargeStatus;
}

export interface UpdateAdditionalChargeRequest {
  name?: string;
  description?: string;
  amount?: number;
  billing_type?: ChargeBillingType;
  frequency?: ChargeFrequency | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: ChargeStatus;
}

interface GetChargesParams {
  scope?: ChargeScope;
  property_id?: string;
  unit_id?: string;
  status?: ChargeStatus;
  per_page?: number;
}

export const additionalChargeService = {
  getCharges: async (params?: GetChargesParams) => {
    const response = await api.get('/organization/charges', { params });
    return response.data;
  },

  getCharge: async (id: string): Promise<AdditionalCharge> => {
    const response = await api.get(`/organization/charges/${id}`);
    return response.data;
  },

  createCharge: async (data: CreateAdditionalChargeRequest): Promise<AdditionalCharge> => {
    const response = await api.post('/organization/charges', data);
    return response.data.charge;
  },

  updateCharge: async (id: string, data: UpdateAdditionalChargeRequest): Promise<AdditionalCharge> => {
    const response = await api.put(`/organization/charges/${id}`, data);
    return response.data.charge;
  },

  deleteCharge: async (id: string): Promise<void> => {
    await api.delete(`/organization/charges/${id}`);
  },
};
