import axios from 'axios';
import environment from '../../../config/environment';
import appConfig from '../../../config/appConfig';
import platformAuthStorage from './platformAuthStorage';

const client = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: appConfig.requestTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = platformAuthStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Request-Id'] = crypto.randomUUID();
  return config;
});

const unwrap = (response) => {
  const body = response.data;
  return body && typeof body === 'object' && 'data' in body ? body.data : body;
};

// environment.apiBaseUrl already includes the /api/v1 prefix.
const endpoint = '/platform';

export const platformService = {
  login: (payload) => client.post(`${endpoint}/auth/login`, payload).then(unwrap),
  listTenants: () => client.get(`${endpoint}/tenants`).then(unwrap),
  createTenant: (payload) => client.post(`${endpoint}/tenants`, payload).then(unwrap),
  provisionTenant: (id) => client.post(`${endpoint}/tenants/${id}/provision`).then(unwrap),
  suspendTenant: (id) => client.post(`${endpoint}/tenants/${id}/suspend`).then(unwrap),
  pauseCloudProject: (id) => client.post(`${endpoint}/tenants/${id}/pause-cloud`).then(unwrap),
  restoreCloudProject: (id) => client.post(`${endpoint}/tenants/${id}/restore-cloud`).then(unwrap),
  scheduleDeletion: (id) => client.post(`${endpoint}/tenants/${id}/schedule-deletion`).then(unwrap),
};

export default platformService;
