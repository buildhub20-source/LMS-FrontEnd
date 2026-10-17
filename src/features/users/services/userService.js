import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

// In-memory mock database for development offline fallback
let mockUsers = [
  {
    id: 'user-1',
    fullName: 'Jane Doe',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    active: true,
    locked: false,
    roles: [{ id: 'role-1', name: 'ADMIN', description: 'Administrator' }],
    createdAt: '2026-01-15T08:30:00Z',
  },
  {
    id: 'user-2',
    fullName: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    active: true,
    locked: false,
    roles: [{ id: 'role-2', name: 'INSTRUCTOR', description: 'Instructor' }],
    createdAt: '2026-02-10T11:45:00Z',
  },
  {
    id: 'user-3',
    fullName: 'Bob Johnson',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    active: false,
    locked: false,
    roles: [],
    createdAt: '2026-03-01T09:15:00Z',
  },
  {
    id: 'user-4',
    fullName: 'Alice Williams',
    firstName: 'Alice',
    lastName: 'Williams',
    email: 'alice.williams@example.com',
    active: true,
    locked: true,
    roles: [],
    createdAt: '2026-03-12T14:20:00Z',
  },
];

let mockHistory = {
  'user-1': [
    { id: 'h-1', action: 'ACTIVATED', description: 'Account activated by Super Admin', performedBy: 'Super Admin', performedAt: '2026-01-15T08:31:00Z' }
  ],
  'user-4': [
    { id: 'h-2', action: 'LOCKED', description: 'Account locked due to 3 failed login attempts', performedBy: 'System', performedAt: '2026-03-20T10:00:00Z' }
  ]
};

async function devFallback(fn, fallbackData) {
  if (import.meta.env.DEV) {
    try {
      return await fn();
    } catch (err) {
      // Check if it's a network/connection error
      if (!err.response || err.code === 'ERR_NETWORK') {
        console.warn('Backend offline. Falling back to mock dev data.');
        return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
      }
      throw err;
    }
  }
  return fn();
}

export const userService = {
  list: (params) =>
    devFallback(
      () => http.get(API_ENDPOINTS.users.base, { params }),
      () => {
        let list = [...mockUsers];
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
        }
        if (params?.status && params.status !== 'ALL') {
          if (params.status === 'ACTIVE') list = list.filter(u => u.active && !u.locked);
          if (params.status === 'LOCKED') list = list.filter(u => u.locked);
          if (params.status === 'INACTIVE') list = list.filter(u => !u.active);
        }
        return { content: list, totalPages: 1, totalElements: list.length };
      }
    ),

  getById: (id) =>
    devFallback(
      () => http.get(API_ENDPOINTS.users.byId(id)),
      () => mockUsers.find((u) => u.id === id)
    ),

  create: (payload) =>
    devFallback(
      () => http.post(API_ENDPOINTS.users.base, payload),
      () => {
        const newUser = {
          id: `user-${Date.now()}`,
          fullName: `${payload.firstName} ${payload.lastName}`,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          active: true,
          locked: false,
          roles: [],
          createdAt: new Date().toISOString(),
        };
        mockUsers.push(newUser);
        return newUser;
      }
    ),

  update: (id, payload) =>
    devFallback(
      () => http.put(API_ENDPOINTS.users.byId(id), payload),
      () => {
        mockUsers = mockUsers.map((u) =>
          u.id === id
            ? {
                ...u,
                ...payload,
                fullName: `${payload.firstName || u.firstName} ${payload.lastName || u.lastName}`,
              }
            : u
        );
        return mockUsers.find((u) => u.id === id);
      }
    ),

  changeStatus: (id, status) =>
    devFallback(
      () => http.patch(API_ENDPOINTS.users.status(id), { status }),
      () => {
        mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, active: status === 'ACTIVE' } : u));
        return mockUsers.find((u) => u.id === id);
      }
    ),

  remove: (id) =>
    devFallback(
      () => http.delete(API_ENDPOINTS.users.byId(id)),
      () => {
        mockUsers = mockUsers.filter((u) => u.id !== id);
        return { success: true };
      }
    ),

  activate: (id) =>
    devFallback(
      () => http.post(API_ENDPOINTS.users.activate(id)),
      () => {
        mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, active: true } : u));
        if (!mockHistory[id]) mockHistory[id] = [];
        mockHistory[id].unshift({ id: `h-${Date.now()}`, action: 'ACTIVATED', description: 'Account activated manually', performedBy: 'Dev Admin', performedAt: new Date().toISOString() });
        return mockUsers.find((u) => u.id === id);
      }
    ),

  deactivate: (id) =>
    devFallback(
      () => http.post(API_ENDPOINTS.users.deactivate(id)),
      () => {
        mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, active: false } : u));
        if (!mockHistory[id]) mockHistory[id] = [];
        mockHistory[id].unshift({ id: `h-${Date.now()}`, action: 'DEACTIVATED', description: 'Account deactivated manually', performedBy: 'Dev Admin', performedAt: new Date().toISOString() });
        return mockUsers.find((u) => u.id === id);
      }
    ),

  lock: (id) =>
    devFallback(
      () => http.post(API_ENDPOINTS.users.lock(id)),
      () => {
        mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, locked: true } : u));
        if (!mockHistory[id]) mockHistory[id] = [];
        mockHistory[id].unshift({ id: `h-${Date.now()}`, action: 'LOCKED', description: 'Account locked manually', performedBy: 'Dev Admin', performedAt: new Date().toISOString() });
        return mockUsers.find((u) => u.id === id);
      }
    ),

  unlock: (id) =>
    devFallback(
      () => http.post(API_ENDPOINTS.users.unlock(id)),
      () => {
        mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, locked: false } : u));
        if (!mockHistory[id]) mockHistory[id] = [];
        mockHistory[id].unshift({ id: `h-${Date.now()}`, action: 'UNLOCKED', description: 'Account unlocked manually', performedBy: 'Dev Admin', performedAt: new Date().toISOString() });
        return mockUsers.find((u) => u.id === id);
      }
    ),

  getStatusHistory: (id) =>
    devFallback(
      () => http.get(API_ENDPOINTS.users.statusHistory(id)),
      () => mockHistory[id] || []
    ),

  updateRoles: (id, roleIds) =>
    devFallback(
      () => http.put(API_ENDPOINTS.users.roles(id), { roleIds }),
      () => {
        // mock mapping
        const assigned = roleIds.map((rId) => ({ id: rId, name: rId === 'role-1' ? 'ADMIN' : rId === 'role-2' ? 'INSTRUCTOR' : 'STUDENT' }));
        mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, roles: assigned } : u));
        return mockUsers.find((u) => u.id === id);
      }
    ),
};

export default userService;
