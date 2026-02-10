import api from './api';

// ----------------------------------------------------------------------

export type UtilityType = 'water' | 'electricity';

export interface MeterReadingSummary {
  id: string;
  reading_date: string;
  reading_value: string | number;
  is_estimated: boolean;
}

export interface Meter {
  id: string;
  organization_id: string;
  property_id: string;
  unit_id: string | null;
  utility_type: UtilityType;
  meter_number?: string | null;
  name?: string | null;
  location?: string | null;
  is_shared: boolean;
  status: 'active' | 'inactive' | 'faulty';
  installed_on?: string | null;
  latest_reading?: MeterReadingSummary | null;
  latestReading?: MeterReadingSummary | null;
  unit?: { id: string; unit_number?: string; name?: string } | null;
  assigned_units?: Array<{ id: string; unit_number?: string; name?: string; pivot?: { allocation_ratio?: string | number | null } }>;
  assignedUnits?: Array<{ id: string; unit_number?: string; name?: string; pivot?: { allocation_ratio?: string | number | null } }>;
}

export interface UtilityTariff {
  id: string;
  organization_id: string;
  property_id: string | null;
  utility_type: UtilityType;
  rate_per_unit: string | number;
  fixed_charge: string | number;
  currency: string;
  effective_from: string;
  effective_to: string | null;
}

export const utilityService = {
  // Meters
  listMeters: async (params?: Record<string, any>): Promise<any> => {
    const { data } = await api.get('/utilities/meters', { params });
    return data;
  },

  createMeter: async (payload: any): Promise<any> => {
    const { data } = await api.post('/utilities/meters', payload);
    return data;
  },

  updateMeter: async (id: string, payload: any): Promise<any> => {
    const { data } = await api.put(`/utilities/meters/${id}`, payload);
    return data;
  },

  deleteMeter: async (id: string): Promise<void> => {
    await api.delete(`/utilities/meters/${id}`);
  },

  // Tariffs
  listTariffs: async (params?: Record<string, any>): Promise<any> => {
    const { data } = await api.get('/utilities/tariffs', { params });
    return data;
  },

  createTariff: async (payload: any): Promise<any> => {
    const { data } = await api.post('/utilities/tariffs', payload);
    return data;
  },

  updateTariff: async (id: string, payload: any): Promise<any> => {
    const { data } = await api.put(`/utilities/tariffs/${id}`, payload);
    return data;
  },

  deleteTariff: async (id: string): Promise<void> => {
    await api.delete(`/utilities/tariffs/${id}`);
  },

  // Readings
  bulkSaveReadings: async (payload: {
    property_id: string;
    reading_date: string;
    readings: Array<{ meter_id: string; reading_value: number; is_estimated?: boolean; notes?: string }>;
  }): Promise<any> => {
    const { data } = await api.post('/utilities/readings/bulk', payload);
    return data;
  },

  // Billing
  runBilling: async (payload: {
    start_date: string;
    end_date: string;
    due_date: string;
    property_id?: string;
    utility_type?: UtilityType;
    create_invoices?: boolean;
  }): Promise<any> => {
    const { data } = await api.post('/utilities/billing/run', payload);
    return data;
  },
};
