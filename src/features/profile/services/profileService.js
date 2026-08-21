import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const profileService = {
  get: () => http.get(API_ENDPOINTS.profile.base),
  update: (payload) => http.put(API_ENDPOINTS.profile.base, payload),
  changePassword: (payload) => http.post(API_ENDPOINTS.profile.changePassword, payload),
  uploadAvatar: (file) => {
    const body = new FormData();
    body.append('file', file);
    return http.post(API_ENDPOINTS.profile.avatar, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default profileService;
