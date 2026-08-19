import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const userService = {
  list: (params) => http.get(API_ENDPOINTS.users.base, { params }),
  getById: (id) => http.get(API_ENDPOINTS.users.byId(id)),
  create: (payload) => http.post(API_ENDPOINTS.users.base, payload),
  update: (id, payload) => http.put(API_ENDPOINTS.users.byId(id), payload),
  changeStatus: (id, status) => http.patch(API_ENDPOINTS.users.status(id), { status }),
  remove: (id) => http.delete(API_ENDPOINTS.users.byId(id)),
};

export default userService;
