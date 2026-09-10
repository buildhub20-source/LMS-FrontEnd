import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * Admin operations for assessment sections.
 */
export const assessmentSectionService = {
    // Get all sections with their questions for an assessment
    getSections: async (assessmentId) => {
        return http.get(`/admin/assessments/${assessmentId}/sections`);
    },

    // Create a new section
    createSection: async (assessmentId, data) => {
        return http.post(`/admin/assessments/${assessmentId}/sections`, data);
    },

    // Update section
    updateSection: async (sectionId, data) => {
        return http.put(`/admin/assessments/sections/${sectionId}`, data);
    },

    // Delete section
    deleteSection: async (sectionId) => {
        return http.delete(`/admin/assessments/sections/${sectionId}`);
    },

    // Add a new question to a specific section
    addQuestionToSection: async (assessmentId, sectionId, data) => {
        // The URL based on AdminQuestionController is POST /api/v1/admin/assessments/{assessmentId}/sections/{sectionId}/questions
        return http.post(`/admin/assessments/${assessmentId}/sections/${sectionId}/questions`, data);
    },

    // Move an existing question to a section
    moveQuestionToSection: async (sectionId, assessmentQuestionId) => {
        return http.put(`/admin/assessments/sections/${sectionId}/questions/${assessmentQuestionId}`);
    },
    
    // Remove a question from any section (making it unsectioned)
    removeQuestionFromSection: async (assessmentQuestionId) => {
        return http.put(`/admin/assessments/questions/${assessmentQuestionId}/unsection`);
    }
};
