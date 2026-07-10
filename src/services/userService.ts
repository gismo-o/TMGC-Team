import { UserProfile } from '../context/UserContext';
import { apiFetch } from './apiClient';
import { API_PROFILES_URL } from './apiConfig';

export const userService = {
  getProfile: async (_userId: string): Promise<UserProfile> => {
    return apiFetch<UserProfile>(`${API_PROFILES_URL}/me`);
  },

  updateProfile: async (_userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiFetch<UserProfile>(`${API_PROFILES_URL}/me`, {
      method: 'PUT',
      body: data,
    });
  },
};
