import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const tenantService = {
  getCurrent: () => http.get(API_ENDPOINTS.tenants.current).then((r) => r.data?.data ?? r.data),
  updateSettings: (payload) => http.put(API_ENDPOINTS.tenants.settings, payload).then((r) => r.data?.data ?? r.data),
  updateBranding: (payload) => http.put(API_ENDPOINTS.tenants.branding, payload).then((r) => r.data?.data ?? r.data),
};

export default tenantService;
