import api from './api';

// Types
export interface OwnerStatementParams {
  property_id?: string;
  start_date: string;
  end_date: string;
}

export interface RentRollParams {
  property_id?: string;
  as_of_date?: string;
}

export interface ProfitabilityParams {
  start_date: string;
  end_date: string;
  property_id?: string;
}

export interface OccupancyTrendParams {
  start_date: string;
  end_date: string;
  property_id?: string;
}

export interface TaxExportParams {
  start_date?: string;
  end_date?: string;
  tax_method?: 'mri' | 'annual' | 'withholding';
}

export interface PropertySummary {
  id: string;
  name: string;
  address?: string;
  units_count?: number;
}

export interface IncomeByMethod {
  total_received: number;
  payment_method: string;
  transaction_count: number;
}

export interface ExpenseByCategory {
  total_cost: number;
  category: string;
  work_order_count: number;
}

export interface InvoiceByStatus {
  invoice_count: number;
  total_billed: number;
  total_collected: number;
  status: string;
}

export interface Occupancy {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
}

export interface OwnerStatement {
  property: PropertySummary;
  period: {
    start_date: string;
    end_date: string;
  };
  income: {
    total: number;
    by_method: IncomeByMethod[];
  };
  expenses: {
    total: number;
    by_category: ExpenseByCategory[];
  };
  invoicing: {
    total_billed: number;
    total_collected: number;
    collection_rate: number;
    by_status: InvoiceByStatus[];
  };
  net_income: number;
  occupancy: Occupancy;
}

export interface OwnerStatementResponse {
  statements: OwnerStatement[];
  summary: {
    total_income: number;
    total_expenses: number;
    net_income: number;
  };
}

export interface RentRollEntry {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  property: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    unit_number: string;
    type: string;
  };
  lease: {
    id: string;
    lease_number: string;
    start_date: string;
    end_date: string | null;
    rent_amount: number;
    deposit_amount: number;
  };
  payment_status: {
    outstanding_balance: number;
    days_overdue: number;
    last_payment_date: string | null;
    last_payment_amount: number | null;
    status: 'current' | 'outstanding' | 'overdue';
  };
}

export interface RentRollResponse {
  rent_roll: RentRollEntry[];
  summary: {
    total_tenants: number;
    total_outstanding: number;
    total_monthly_rent: number;
    overdue_count: number;
  };
  as_of_date: string;
}

export interface MonthlyBreakdown {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ProfitabilityEntry {
  property: PropertySummary;
  revenue: number;
  expenses: number;
  profit: number;
  profit_margin: number;
  potential_revenue: number;
  collection_rate: number;
  monthly_breakdown: MonthlyBreakdown[];
}

export interface ProfitabilityResponse {
  profitability: ProfitabilityEntry[];
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_expenses: number;
    total_profit: number;
  };
}

export interface ArrearsInvoice {
  invoice_id: string;
  invoice_number: string;
  tenant_name: string;
  property_name: string;
  unit_number: string;
  due_date: string;
  days_overdue: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
}

export interface AgingBucket {
  label: string;
  invoices: ArrearsInvoice[];
  total: number;
}

export interface ArrearsAgingResponse {
  aging_buckets: {
    '0-30': AgingBucket;
    '31-60': AgingBucket;
    '61-90': AgingBucket;
    '90+': AgingBucket;
  };
  summary: {
    total_overdue: number;
    total_invoices: number;
  };
}

export interface MonthlyOccupancy {
  month: string;
  occupied_units: number;
  vacant_units: number;
  total_units: number;
  occupancy_rate: number;
}

export interface OccupancyTrendEntry {
  property: PropertySummary;
  monthly_trend: MonthlyOccupancy[];
  average_occupancy: number;
}

export interface OccupancyTrendResponse {
  occupancy_trends: OccupancyTrendEntry[];
  period: {
    start_date: string;
    end_date: string;
  };
}

// Service methods
const reportService = {
  getOwnerStatement: async (params: OwnerStatementParams): Promise<OwnerStatementResponse> => {
    const response = await api.get('/reports/owner-statement', { params });
    return response.data;
  },

  getRentRoll: async (params: RentRollParams): Promise<RentRollResponse> => {
    const response = await api.get('/reports/rent-roll', { params });
    return response.data;
  },

  getProfitability: async (params: ProfitabilityParams): Promise<ProfitabilityResponse> => {
    const response = await api.get('/reports/profitability', { params });
    return response.data;
  },

  getArrearsAging: async (property_id?: string): Promise<ArrearsAgingResponse> => {
    const response = await api.get('/reports/arrears-aging', {
      params: property_id ? { property_id } : {},
    });
    return response.data;
  },

  getOccupancyTrend: async (params: OccupancyTrendParams): Promise<OccupancyTrendResponse> => {
    const response = await api.get('/reports/occupancy-trend', { params });
    return response.data;
  },

  exportTaxCsv: async (params: TaxExportParams): Promise<Blob> => {
    const response = await api.get('/invoices/export/tax-csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  downloadCsv: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reportService;
