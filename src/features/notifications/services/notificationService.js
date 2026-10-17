import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const notificationService = {
  list: (params) => http.get(API_ENDPOINTS.notifications.base, { params }),
  markRead: (id) => http.patch(API_ENDPOINTS.notifications.read(id)),
  markAllRead: () => http.patch(API_ENDPOINTS.notifications.readAll),
};

export default notificationService;
