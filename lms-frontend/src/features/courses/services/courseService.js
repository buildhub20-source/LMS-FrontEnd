import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const courseService = {
  list: (params) => http.get(API_ENDPOINTS.courses.base, { params }),
  listMine: (params) => http.get(API_ENDPOINTS.courses.mine, { params }),
  getById: (id) => http.get(API_ENDPOINTS.courses.byId(id)),
  create: (payload) => http.post(API_ENDPOINTS.courses.base, payload),
  update: (id, payload) => http.put(API_ENDPOINTS.courses.byId(id), payload),
  publish: (id) => http.post(API_ENDPOINTS.courses.publish(id)),
  remove: (id) => http.delete(API_ENDPOINTS.courses.byId(id)),
  uploadThumbnail: (id, file) => {
    const body = new FormData();
    body.append('file', file);
    return http.post(API_ENDPOINTS.courses.thumbnail(id), body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default courseService;
