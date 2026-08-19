import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const authService = {
  login: (credentials) => http.post(API_ENDPOINTS.auth.login, credentials),
  logout: () => http.post(API_ENDPOINTS.auth.logout),
  getCurrentUser: () => http.get(API_ENDPOINTS.auth.me),
  forgotPassword: (payload) => http.post(API_ENDPOINTS.auth.forgotPassword, payload),
  resetPassword: (payload) => http.post(API_ENDPOINTS.auth.resetPassword, payload),
  acceptInvitation: (payload) => http.post(API_ENDPOINTS.auth.acceptInvitation, payload),
};

export default authService;
