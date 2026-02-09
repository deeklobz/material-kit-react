import api from './api';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  organization_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
  organization?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  users_by_role: Record<string, number>;
  new_users_this_month: number;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  organization_id?: number;
  phone?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  role?: string;
  organization_id?: number;
  phone?: string;
}

interface GetUsersParams {
  role?: string;
  organization_id?: number;
  status?: 'active' | 'suspended';
  search?: string;
  page?: number;
}

const userManagementService = {
  // Get all users
  getUsers: async (params?: GetUsersParams) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get user statistics
  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  },

  // Get a specific user
  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Create a user
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/admin/users', data);
    return response.data.user;
  },

  // Update a user
  updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data.user;
  },

  // Suspend a user
  suspendUser: async (id: number): Promise<any> => {
    const response = await api.post(`/admin/users/${id}/suspend`);
    return response.data;
  },

  // Activate a user
  activateUser: async (id: number): Promise<any> => {
    const response = await api.post(`/admin/users/${id}/activate`);
    return response.data;
  },

  // Delete a user
  deleteUser: async (id: number): Promise<any> => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default userManagementService;
