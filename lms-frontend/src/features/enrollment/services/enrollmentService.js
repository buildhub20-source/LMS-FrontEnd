import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const enrollmentService = {
  // Admin Operations
  getAdminEnrollments: async (params) => {
    const response = await http.get(API_ENDPOINTS.adminEnrollments.base, { params });
    return response.data || response;
  },
  getAdminEnrollmentById: async (id) => {
    const response = await http.get(API_ENDPOINTS.adminEnrollments.byId(id));
    return response.data || response;
  },
  createAdminEnrollment: async (data) => {
    const response = await http.post(API_ENDPOINTS.adminEnrollments.base, data);
    return response.data || response;
  },
  updateAdminEnrollmentStatus: async (id, status) => {
    const response = await http.patch(API_ENDPOINTS.adminEnrollments.status(id), { status });
    return response.data || response;
  },

  // Instructor Operations
  getInstructorEnrollments: async (params) => {
    const response = await http.get(API_ENDPOINTS.instructorEnrollments.base, { params });
    return response.data || response;
  },
  getInstructorEnrollmentById: async (id) => {
    const response = await http.get(API_ENDPOINTS.instructorEnrollments.byId(id));
    return response.data || response;
  },
  createInstructorEnrollment: async (data) => {
    const response = await http.post(API_ENDPOINTS.instructorEnrollments.base, data);
    return response.data || response;
  },
  updateInstructorEnrollmentStatus: async (id, status) => {
    const response = await http.patch(API_ENDPOINTS.instructorEnrollments.status(id), { status });
    return response.data || response;
  },

  // Student Operations
  getStudentEnrollments: async (params) => {
    const response = await http.get(API_ENDPOINTS.studentEnrollments.base, { params });
    return response.data || response;
  },
  getStudentEnrollmentById: async (id) => {
    const response = await http.get(API_ENDPOINTS.studentEnrollments.byId(id));
    return response.data || response;
  },
};

  // Instructor Operations
  getInstructorEnrollments: async (params) => {
    const response = await http.get(API_ENDPOINTS.instructorEnrollments.base, { params });
    return response.data || response;
  },
  getInstructorEnrollmentById: async (id) => {
    const response = await http.get(API_ENDPOINTS.instructorEnrollments.byId(id));
    return response.data || response;
  },
  createInstructorEnrollment: async (data) => {
    const response = await http.post(API_ENDPOINTS.instructorEnrollments.base, data);
    return response.data || response;
  },
  updateInstructorEnrollmentStatus: async (id, status) => {
    const response = await http.patch(API_ENDPOINTS.instructorEnrollments.status(id), { status });
    return response.data || response;
  },

  // Student Operations
  getStudentEnrollments: async (params) => {
    const response = await http.get(API_ENDPOINTS.studentEnrollments.base, { params });
    return response.data || response;
  },
  getStudentEnrollmentById: async (id) => {
    const response = await http.get(API_ENDPOINTS.studentEnrollments.byId(id));
    return response.data || response;
  },
};
