import api from './api';

export interface PropertyExpense {
  id: string;
  organization_id: string;
  property_id: string;
  vendor_id?: string | null;
  created_by?: string | null;
  incurred_on: string; // YYYY-MM-DD
  amount: number | string;
  category: string;
  reference?: string | null;
  description?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;

  property?: { id: string; name: string };
  vendor?: { id: string; name: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PropertyExpenseListParams {
  property_id?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PropertyExpenseCreateData {
  property_id: string;
  vendor_id?: string;
  incurred_on: string;
  amount: number;
  category: string;
  reference?: string;
  description?: string;
}

export const propertyExpenseService = {
  getAll: async (params?: PropertyExpenseListParams): Promise<PaginatedResponse<PropertyExpense>> => {
    const { data } = await api.get('/property-expenses', { params });
    return data;
  },

  create: async (payload: PropertyExpenseCreateData): Promise<PropertyExpense> => {
    const { data } = await api.post('/property-expenses', payload);
    return data.expense || data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/property-expenses/${id}`);
  },
};
