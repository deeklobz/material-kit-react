import api from './api';

// -----------------------------------------------------------------------

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  joinedDate: string;
  lastActivity: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  role: string;
  permission: string;
}

export interface UpdateStaffRequest {
  name?: string;
  email?: string;
  role?: string;
  permission?: string;
}

class StaffManagementService {
  async getStaffMembers(): Promise<StaffMember[]> {
    const response = await api.get('/organization/staff');
    // Backend returns a Laravel paginator
    return response.data?.data ?? response.data;
  }

  async inviteStaff(data: CreateStaffRequest): Promise<StaffMember> {
    const response = await api.post('/organization/staff', data);
    return response.data;
  }

  async updateStaff(id: string, data: UpdateStaffRequest): Promise<StaffMember> {
    const response = await api.put(`/organization/staff/${id}`, data);
    return response.data;
  }

  async removeStaff(id: string): Promise<void> {
    await api.delete(`/organization/staff/${id}`);
  }

  async suspendStaff(id: string): Promise<StaffMember> {
    const response = await api.post(`/organization/staff/${id}/suspend`);
    return response.data;
  }

  async activateStaff(id: string): Promise<StaffMember> {
    const response = await api.post(`/organization/staff/${id}/activate`);
    return response.data;
  }

  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await api.post(`/organization/staff/${id}/reset-password`);
    return response.data;
  }
}

export const staffManagementService = new StaffManagementService();
