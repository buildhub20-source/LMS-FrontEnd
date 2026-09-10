import axios from 'axios';
import environment from '../../../config/environment';
import { onRequest, onRequestError } from '../../../services/api/requestInterceptor';

// This client intentionally has its own base URL. Certificate generation is a
// separate service, while the browser still sends the same JWT and tenant header.
const certificateClient = axios.create({
  baseURL: environment.certificateServiceBaseUrl,
  timeout: 30_000,
  withCredentials: true,
});

certificateClient.interceptors.request.use(onRequest, onRequestError);

export const certificateTemplateService = {
  list: () => certificateClient.get('/api/v1/admin/certificate-templates').then((response) => response.data),
  uploadInstitutionPdf: ({ file, template }) => {
    const form = new FormData();
    form.append('file', file);
    form.append('template', new Blob([JSON.stringify(template)], { type: 'application/json' }));
    return certificateClient.post('/api/v1/admin/certificate-templates/institution-pdf', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((response) => response.data);
  },
  createLmsRendered: ({ name = 'Platform Dynamic Template', isDefault = true } = {}) =>
    certificateClient.post('/api/v1/admin/certificate-templates', {
      name,
      sourceType: 'LMS_RENDERED',
      isDefault,
    }).then((response) => response.data),
  preview: (templateId) =>
    certificateClient.get(`/api/v1/admin/certificate-templates/${templateId}/preview`, {
      responseType: 'blob',
    }),
  setDefault: (templateId) =>
    certificateClient.put(`/api/v1/admin/certificate-templates/${templateId}/set-default`).then((response) => response.data),
  remove: (templateId) => certificateClient.delete(`/api/v1/admin/certificate-templates/${templateId}`),
};

export default certificateTemplateService;
