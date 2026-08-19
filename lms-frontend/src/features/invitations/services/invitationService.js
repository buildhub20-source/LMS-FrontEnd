import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const invitationService = {
  list: (params) => http.get(API_ENDPOINTS.invitations.base, { params }),
  invite: (payload) => http.post(API_ENDPOINTS.invitations.base, payload),
  resend: (id) => http.post(API_ENDPOINTS.invitations.resend(id)),
  revoke: (id) => http.delete(API_ENDPOINTS.invitations.byId(id)),
};

export default invitationService;
