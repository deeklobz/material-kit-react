import api from './api';

// -----------------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  registrationNumber: string;
  taxId: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  registrationNumber: string;
  taxId: string;
  logo?: File;
}

class OrganizationService {
  async getOrganization(): Promise<Organization> {
    const response = await api.get('/api/organization');
    return response.data;
  }

  async updateOrganization(data: OrganizationFormData): Promise<Organization> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    const response = await api.post('/api/organization', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadLogo(file: File): Promise<{ logo: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post('/api/organization/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const organizationService = new OrganizationService();
