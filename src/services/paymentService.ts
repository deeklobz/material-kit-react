import api from './api';

export interface Payment {
  id: string;
  receipt_number: string;
  tenant_id: string;
  invoice_id?: string;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'mpesa' | 'bank' | 'cheque' | 'other';
  reference_number?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  tenant?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
    type: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  tenant_id: string;
  invoice_id?: string;
  receipt_number: string;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'mpesa' | 'bank' | 'cheque' | 'other';
  reference_number?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
}

interface GetPaymentsParams {
  tenant_id?: string;
  payment_method?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}

export const paymentService = {
  getAll: async (params?: GetPaymentsParams) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: PaymentFormData): Promise<Payment> => {
    const response = await api.post('/payments', data);
    return response.data.payment || response.data.data || response.data;
  },

  update: async (id: string, data: Partial<PaymentFormData>): Promise<Payment> => {
    const response = await api.put(`/payments/${id}`, data);
    return response.data.payment || response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },

  reverse: async (id: string, reason?: string): Promise<Payment> => {
    const response = await api.post(`/payments/${id}/reverse`, { reason });
    return response.data.payment || response.data.data || response.data;
  },
};
