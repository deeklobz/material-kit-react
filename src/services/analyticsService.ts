import api from './api';

// ----------------------------------------------------------------------

export interface PlatformAnalytics {
  overview: {
    total_organizations: number;
    active_organizations: number;
    total_properties: number;
    total_units: number;
    total_tenants: number;
    total_users: number;
    occupancy_rate: number;
  };
  revenue: {
    total_revenue: number;
    monthly_revenue: number;
    yearly_revenue: number;
    average_revenue_per_org: number;
    revenue_growth: number;
  };
  subscriptions: {
    total_subscriptions: number;
    active_subscriptions: number;
    trial_subscriptions: number;
    expired_subscriptions: number;
    conversion_rate: number;
    churn_rate: number;
  };
  plan_distribution: {
    plan_name: string;
    plan_code: string;
    count: number;
    percentage: number;
    revenue: number;
  }[];
  growth_trends: {
    month: string;
    organizations: number;
    subscriptions: number;
    revenue: number;
  }[];
  top_organizations: {
    id: string;
    name: string;
    properties_count: number;
    units_count: number;
    revenue: number;
  }[];
}

const analyticsService = {
  // Get platform analytics
  getAnalytics: async (): Promise<PlatformAnalytics> => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // Export analytics report
  exportReport: async (format: 'csv' | 'pdf' | 'excel'): Promise<Blob> => {
    const response = await api.get(`/admin/analytics/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default analyticsService;
