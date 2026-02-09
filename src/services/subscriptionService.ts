import api from './api';

// ----------------------------------------------------------------------

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  trial_days: number;
  max_properties?: number;
  max_units?: number;
  max_users?: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trial_ends_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string;
  organization?: {
    id: string;
    name: string;
    email: string;
  };
  plan?: {
    id: string;
    name: string;
    price: number;
  };
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanFormData {
  name: string;
  code: string;
  description?: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  trial_days: number;
  max_properties?: number;
  max_units?: number;
  max_users?: number;
  features: string[];
  is_active: boolean;
}

export const subscriptionPlanService = {
  getAll: async (): Promise<SubscriptionPlan[]> => {
    const { data } = await api.get('/admin/subscription-plans');
    return data.data || data;
  },

  getById: async (id: string): Promise<SubscriptionPlan> => {
    const { data } = await api.get(`/admin/subscription-plans/${id}`);
    return data.data || data;
  },

  create: async (planData: SubscriptionPlanFormData): Promise<SubscriptionPlan> => {
    const { data } = await api.post('/admin/subscription-plans', planData);
    return data.data || data;
  },

  update: async (id: string, planData: Partial<SubscriptionPlanFormData>): Promise<SubscriptionPlan> => {
    const { data } = await api.put(`/admin/subscription-plans/${id}`, planData);
    return data.data || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/subscription-plans/${id}`);
  },
};

export const subscriptionService = {
  getAll: async (): Promise<Subscription[]> => {
    const { data } = await api.get('/admin/subscriptions');
    return data.data || data;
  },

  getById: async (id: string): Promise<Subscription> => {
    const { data } = await api.get(`/admin/subscriptions/${id}`);
    return data.data || data;
  },

  cancel: async (id: string): Promise<Subscription> => {
    const { data } = await api.post(`/admin/subscriptions/${id}/cancel`);
    return data.data || data;
  },

  reactivate: async (id: string): Promise<Subscription> => {
    const { data } = await api.post(`/admin/subscriptions/${id}/reactivate`);
    return data.data || data;
  },
};
