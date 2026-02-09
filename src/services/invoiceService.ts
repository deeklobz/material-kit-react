import api from './api';

export interface InvoiceLineItem {
  id?: string;
  description: string;
  type: 'rent' | 'deposit' | 'water' | 'electricity' | 'garbage' | 'maintenance' | 'late_fee' | 'other';
  quantity: number;
  unit_price: number;
  amount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  tenant_id: string;
  lease_id?: string;
  type: 'rent' | 'deposit' | 'utilities' | 'maintenance' | 'penalty' | 'other';
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount?: number;
  tax_rate?: number;
  tax_method?: 'mri' | 'annual' | 'withholding';
  total_amount: number;
  amount_paid?: number;
  balance?: number;
  notes?: string;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  tenant?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  lease?: {
    id: string;
    lease_number: string;
    rent_amount?: number;
    unit?: {
      id: string;
      unit_number: string;
      property?: { id: string; name: string };
    };
  };
  lineItems?: InvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceFormData {
  tenant_id: string;
  lease_id?: string;
  invoice_number: string;
  type: 'rent' | 'deposit' | 'utilities' | 'maintenance' | 'penalty' | 'other';
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount?: number;
  tax_rate?: number;
  tax_method?: 'mri' | 'annual' | 'withholding';
  total_amount: number;
  notes?: string;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  line_items: InvoiceLineItem[];
}

interface GetInvoicesParams {
  status?: string;
  tenant_id?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}

export const invoiceService = {
  getAll: async (params?: GetInvoicesParams) => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: InvoiceFormData): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data.invoice || response.data.data || response.data;
  },

  update: async (id: string, data: Partial<InvoiceFormData>): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data.invoice || response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  sendInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data.invoice || response.data.data || response.data;
  },
};
