import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * Certificate template setup: the organisation uploads its own PDF, marks
 * where the learner details go, previews the result and publishes it for a
 * course. Only a published template issues certificates — a draft can be
 * previewed as often as you like without affecting anyone.
 */
export const certificateTemplateService = {
  list: () => http.get(API_ENDPOINTS.certificateTemplates.base),

  save: (template) => http.post(API_ENDPOINTS.certificateTemplates.base, template),

  /** Uploads the organisation's PDF along with its field layout. */
  uploadInstitutionPdf: (template, file) => {
    const form = new FormData();
    // The upstream expects the metadata as a JSON part, not form fields.
    form.append(
      'template',
      new Blob([JSON.stringify(template)], { type: 'application/json' }),
    );
    form.append('file', file);
    return http.post(API_ENDPOINTS.certificateTemplates.institutionPdf, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Returns the preview as a PDF blob, rendered with sample learner details. */
  preview: (id) =>
    http.get(API_ENDPOINTS.certificateTemplates.preview(id), { responseType: 'blob' }),

  publish: (id) => http.post(API_ENDPOINTS.certificateTemplates.publish(id)),

  unpublish: (id) => http.post(API_ENDPOINTS.certificateTemplates.unpublish(id)),

  remove: (id) => http.delete(API_ENDPOINTS.certificateTemplates.byId(id)),
};

export default certificateTemplateService;
