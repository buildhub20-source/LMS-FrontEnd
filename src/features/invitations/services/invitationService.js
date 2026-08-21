import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

let mockInvitations = [
  {
    id: 'inv-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    status: 'PENDING',
    roleName: 'INSTRUCTOR',
    role: { id: 'role-2', name: 'INSTRUCTOR' },
    expiresAt: '2026-09-01T00:00:00Z',
    createdBy: 'Dev Admin',
  },
  {
    id: 'inv-2',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'ACCEPTED',
    roleName: 'STUDENT',
    role: { id: 'role-3', name: 'STUDENT' },
    expiresAt: '2026-08-15T00:00:00Z',
    createdBy: 'Dev Admin',
  },
  {
    id: 'inv-3',
    name: 'David Miller',
    email: 'david.miller@example.com',
    status: 'EXPIRED',
    roleName: 'STUDENT',
    role: { id: 'role-3', name: 'STUDENT' },
    expiresAt: '2026-08-01T00:00:00Z',
    createdBy: 'Dev Admin',
  },
];

async function devFallback(fn, fallbackData) {
  if (import.meta.env.DEV) {
    try {
      return await fn();
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        console.warn('Backend offline. Falling back to mock dev invitation data.');
        return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
      }
      throw err;
    }
  }
  return fn();
}

export const invitationService = {
  list: (params) =>
    devFallback(
      () => http.get(API_ENDPOINTS.invitations.base, { params }),
      () => {
        let list = [...mockInvitations];
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(i => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
        }
        if (params?.status && params.status !== 'ALL') {
          list = list.filter(i => i.status === params.status);
        }
        return { content: list, totalPages: 1, totalElements: list.length };
      }
    ),

  invite: (payload) =>
    devFallback(
      () => http.post(API_ENDPOINTS.invitations.base, payload),
      () => {
        const newInv = {
          id: `inv-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          status: 'PENDING',
          roleName: payload.roleId === 'role-1' ? 'ADMIN' : payload.roleId === 'role-2' ? 'INSTRUCTOR' : 'STUDENT',
          role: { id: payload.roleId, name: payload.roleId === 'role-1' ? 'ADMIN' : 'INSTRUCTOR' },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          createdBy: 'Dev Admin',
        };
        mockInvitations.push(newInv);
        return newInv;
      }
    ),

  resend: (id) =>
    devFallback(
      () => http.post(API_ENDPOINTS.invitations.resend(id)),
      () => {
        mockInvitations = mockInvitations.map(inv =>
          inv.id === id
            ? { ...inv, status: 'PENDING', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
            : inv
        );
        return { success: true };
      }
    ),

  revoke: (id) =>
    devFallback(
      () => http.delete(API_ENDPOINTS.invitations.byId(id)),
      () => {
        mockInvitations = mockInvitations.filter(inv => inv.id !== id);
        return { success: true };
      }
    ),
};

export default invitationService;
