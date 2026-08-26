import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const courseService = {
  list: (params) => http.get(API_ENDPOINTS.courses.base, { params }),
  listMine: (params) => http.get(API_ENDPOINTS.courses.mine, { params }),
  getById: (id) => http.get(API_ENDPOINTS.courses.byId(id)),
  create: (payload) => http.post(API_ENDPOINTS.courses.base, payload),
  update: (id, payload) => http.patch(API_ENDPOINTS.courses.byId(id), payload),
  remove: (id) => http.delete(API_ENDPOINTS.courses.byId(id)),

  // Lifecycle transitions
  publish: (id) => http.post(API_ENDPOINTS.courses.publish(id)),
  unpublish: (id) => http.post(API_ENDPOINTS.courses.unpublish(id)),
  archive: (id) => http.post(API_ENDPOINTS.courses.archive(id)),
  submit: (id) => http.post(API_ENDPOINTS.courses.submit(id)),
  approve: (id) => http.post(API_ENDPOINTS.courses.approve(id)),
  reject: (id, payload) => http.post(API_ENDPOINTS.courses.reject(id), payload),

  // Recordings
  getRecordings: (id) => http.get(API_ENDPOINTS.courses.recordings(id)),
  getLessonUploadUrl: (courseId, moduleId, lessonId, payload) =>
    http.post(
      `/api/v1/courses/${courseId}/curriculum/modules/${moduleId}/lessons/${lessonId}/recording/upload-url`,
      payload,
    ),

  // Thumbnail
  uploadThumbnail: (id, file) => {
    const body = new FormData();
    body.append('file', file);
    return http.post(API_ENDPOINTS.courses.thumbnail(id), body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default courseService;
