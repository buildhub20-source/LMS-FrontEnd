import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const roleService = {
  list: (params) => http.get(API_ENDPOINTS.roles.base, { params }),
  getById: (id) => http.get(API_ENDPOINTS.roles.byId(id)),
  create: (payload) => http.post(API_ENDPOINTS.roles.base, payload),
  update: (id, payload) => http.put(API_ENDPOINTS.roles.byId(id), payload),
  listPermissions: () => http.get(API_ENDPOINTS.roles.permissions),
};

export default roleService;
