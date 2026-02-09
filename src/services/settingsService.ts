import api from './api';

interface PlatformSettings {
  name: string;
  url: string;
  timezone: string;
  locale: string;
  maintenance_mode: boolean;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
}

interface EmailSettings {
  driver: string;
  host: string;
  port: number;
  encryption: string;
  from_address: string;
  from_name: string;
}

interface PaymentSettings {
  mpesa_enabled: boolean;
  mpesa_environment: string;
  mpesa_consumer_key: string | null;
  mpesa_shortcode: string;
  mpesa_passkey: string | null;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}

export interface Settings {
  platform: PlatformSettings;
  email: EmailSettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
}

export interface UpdateSettingsRequest {
  section: 'platform' | 'email' | 'payment' | 'notifications';
  settings: Partial<PlatformSettings | EmailSettings | PaymentSettings | NotificationSettings>;
}

const settingsService = {
  // Get all settings
  getSettings: async (): Promise<Settings> => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (data: UpdateSettingsRequest): Promise<any> => {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  // Toggle maintenance mode
  toggleMaintenanceMode: async (enabled: boolean): Promise<any> => {
    const response = await api.post('/admin/settings/maintenance-mode', { enabled });
    return response.data;
  },

  // Upload logo
  uploadLogo: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post('/admin/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default settingsService;
