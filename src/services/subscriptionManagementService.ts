import api from './api';

// ----------------------------------------------------------------------

export interface ActiveSubscription {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_code: string;
  plan_id: string;
  plan_name: string;
  plan_code: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  trial_ends_at?: string;
  next_billing_date?: string;
  amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed';
  auto_renew: boolean;
  properties_count?: number;
  units_count?: number;
  users_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  expired_subscriptions: number;
  total_revenue: number;
  monthly_revenue: number;
  conversion_rate: number;
}

const subscriptionManagementService = {
  // Get all active subscriptions
  getAll: async (): Promise<ActiveSubscription[]> => {
    const response = await api.get('/admin/subscriptions');
    return response.data;
  },

  // Get subscription by ID
  getById: async (id: string): Promise<ActiveSubscription> => {
    const response = await api.get(`/admin/subscriptions/${id}`);
    return response.data;
  },

  // Get subscription statistics
  getStats: async (): Promise<SubscriptionStats> => {
    const response = await api.get('/admin/subscriptions/stats');
    return response.data;
  },

  // Cancel subscription
  cancel: async (id: string): Promise<void> => {
    await api.post(`/admin/subscriptions/${id}/cancel`);
  },

  // Renew subscription
  renew: async (id: string): Promise<void> => {
    await api.post(`/admin/subscriptions/${id}/renew`);
  },

  // Extend trial
  extendTrial: async (id: string, days: number): Promise<void> => {
    await api.post(`/admin/subscriptions/${id}/extend-trial`, { days });
  },
};

export default subscriptionManagementService;
