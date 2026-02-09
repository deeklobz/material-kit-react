import api from './api';

// -----------------------------------------------------------------------

export interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'expired' | 'pending';
  currentAmount: number;
  renewalDate: string;
  trialDaysRemaining: number;
  features: string[];
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface CardData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

class BillingService {
  async getSubscription(): Promise<Subscription> {
    const response = await api.get('/api/organization/subscription');
    return response.data;
  }

  async upgradeSubscription(planId: string): Promise<Subscription> {
    const response = await api.post('/api/organization/subscription/upgrade', { planId });
    return response.data;
  }

  async downgradeSubscription(planId: string): Promise<Subscription> {
    const response = await api.post('/api/organization/subscription/downgrade', { planId });
    return response.data;
  }

  async cancelSubscription(): Promise<void> {
    await api.post('/api/organization/subscription/cancel');
  }

  async getInvoices(): Promise<Invoice[]> {
    const response = await api.get('/api/organization/invoices');
    return response.data;
  }

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    const response = await api.get(`/api/organization/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/api/organization/payment-methods');
    return response.data;
  }

  async addPaymentMethod(cardData: CardData): Promise<PaymentMethod> {
    const response = await api.post('/api/organization/payment-methods', cardData);
    return response.data;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await api.delete(`/api/organization/payment-methods/${id}`);
  }

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    const response = await api.post(`/api/organization/payment-methods/${id}/set-default`);
    return response.data;
  }

  async makePayment(amount: number, paymentMethodId: string): Promise<{ transactionId: string }> {
    const response = await api.post('/api/organization/payments', {
      amount,
      paymentMethodId,
    });
    return response.data;
  }
}

export const billingService = new BillingService();
