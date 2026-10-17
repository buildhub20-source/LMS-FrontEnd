import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

let mockRoles = [
  {
    id: 'role-1',
    name: 'ADMIN',
    description: 'Full administrative access to platform management tools and configurations.',
    userCount: 2,
    createdAt: '2026-01-01T00:00:00Z',
    permissions: [
      { id: 'p-1', name: 'User Read', authority: 'USER_READ' },
      { id: 'p-2', name: 'User Write', authority: 'USER_WRITE' },
      { id: 'p-3', name: 'Role Read', authority: 'ROLE_READ' },
      { id: 'p-4', name: 'Role Write', authority: 'ROLE_WRITE' },
    ],
  },
  {
    id: 'role-2',
    name: 'INSTRUCTOR',
    description: 'Access to course creation, student grading, and instructor analytics dashboard.',
    userCount: 5,
    createdAt: '2026-01-05T00:00:00Z',
    permissions: [
      { id: 'p-5', name: 'Course Read', authority: 'COURSE_READ' },
      { id: 'p-6', name: 'Course Write', authority: 'COURSE_WRITE' },
    ],
  },
];

let mockPermissions = [
  { id: 'p-1', name: 'User Read', authority: 'USER_READ', description: 'Read user list and status history.' },
  { id: 'p-2', name: 'User Write', authority: 'USER_WRITE', description: 'Create, update, lock, and activate users.' },
  { id: 'p-3', name: 'Role Read', authority: 'ROLE_READ', description: 'View access roles.' },
  { id: 'p-4', name: 'Role Write', authority: 'ROLE_WRITE', description: 'Create and modify user access roles.' },
  { id: 'p-5', name: 'Course Read', authority: 'COURSE_READ', description: 'Read course details and structures.' },
  { id: 'p-6', name: 'Course Write', authority: 'COURSE_WRITE', description: 'Create and edit learning courses.' },
];

async function devFallback(fn, fallbackData) {
  if (import.meta.env.DEV) {
    try {
      return await fn();
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        console.warn('Backend offline. Falling back to mock dev role data.');
        return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
      }
      throw err;
    }
  }
  return fn();
}

export const roleService = {
  list: (params) =>
    devFallback(
      () => http.get(API_ENDPOINTS.roles.base, { params }),
      () => {
        let list = [...mockRoles];
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
        }
        return list;
      }
    ),

  getById: (id) =>
    devFallback(
      () => http.get(API_ENDPOINTS.roles.byId(id)),
      () => mockRoles.find((r) => r.id === id)
    ),

  create: (payload) =>
    devFallback(
      () => http.post(API_ENDPOINTS.roles.base, payload),
      () => {
        const newRole = {
          id: `role-${Date.now()}`,
          name: payload.name.toUpperCase(),
          description: payload.description,
          userCount: 0,
          createdAt: new Date().toISOString(),
          permissions: (payload.permissionIds || []).map(pId => mockPermissions.find(p => p.id === pId)).filter(Boolean),
        };
        mockRoles.push(newRole);
        return newRole;
      }
    ),

  update: (id, payload) =>
    devFallback(
      () => http.put(API_ENDPOINTS.roles.byId(id), payload),
      () => {
        mockRoles = mockRoles.map((r) =>
          r.id === id
            ? {
                ...r,
                name: payload.name.toUpperCase(),
                description: payload.description,
                permissions: (payload.permissionIds || []).map(pId => mockPermissions.find(p => p.id === pId)).filter(Boolean),
              }
            : r
        );
        return mockRoles.find((r) => r.id === id);
      }
    ),

  delete: (id) =>
    devFallback(
      () => http.delete(API_ENDPOINTS.roles.byId(id)),
      () => {
        mockRoles = mockRoles.filter((r) => r.id !== id);
        return { success: true };
      }
    ),

  listPermissions: () =>
    devFallback(
      () => http.get(API_ENDPOINTS.roles.permissions),
      () => mockPermissions
    ),

  // Permission CRUD
  createPermission: (payload) =>
    devFallback(
      () => http.post(API_ENDPOINTS.permissions.base, payload),
      () => {
        const newPerm = {
          id: `perm-${Date.now()}`,
          name: payload.name,
          description: payload.description,
          authority: payload.authority.toUpperCase(),
        };
        mockPermissions.push(newPerm);
        return newPerm;
      }
    ),

  updatePermission: (id, payload) =>
    devFallback(
      () => http.put(API_ENDPOINTS.permissions.byId(id), payload),
      () => {
        mockPermissions = mockPermissions.map((p) =>
          p.id === id
            ? {
                ...p,
                name: payload.name,
                description: payload.description,
                authority: payload.authority.toUpperCase(),
              }
            : p
        );
        return mockPermissions.find((p) => p.id === id);
      }
    ),

  deletePermission: (id) =>
    devFallback(
      () => http.delete(API_ENDPOINTS.permissions.byId(id)),
      () => {
        mockPermissions = mockPermissions.filter((p) => p.id !== id);
        return { success: true };
      }
    ),
};

export default roleService;
