import apiClient from "./api";

/**
 * API service للتقارير (Reports)
 * بناءً على التوثيق الكامل لـ Reports API
 */

const REPORTS_BASE_URL = "/reports/";

/**
 * جلب قائمة التقارير
 * GET /api/v1/reports/
 * Query Parameters: student_id, university_id, report_type, is_active
 */
export const fetchReports = async (params = {}) => {
  const response = await apiClient.get(REPORTS_BASE_URL, { params });
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  if (response.data?.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  return [];
};

/**
 * جلب تقرير محدد
 * GET /api/v1/reports/<id>/
 */
export const fetchReportById = async (id) => {
  const response = await apiClient.get(`${REPORTS_BASE_URL}${id}/`);
  return response.data;
};

/**
 * إنشاء تقرير جديد
 * POST /api/v1/reports/
 */
export const createReport = async (data) => {
  const response = await apiClient.post(REPORTS_BASE_URL, data);
  return response.data;
};

/**
 * تحديث تقرير
 * PUT/PATCH /api/v1/reports/<id>/
 */
export const updateReport = async (id, data) => {
  const response = await apiClient.patch(`${REPORTS_BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * حذف تقرير
 * DELETE /api/v1/reports/<id>/
 */
export const deleteReport = async (id) => {
  const response = await apiClient.delete(`${REPORTS_BASE_URL}${id}/`);
  return response.data;
};

/**
 * جلب تقارير طالب محدد
 * GET /api/v1/reports/student/<student_id>/
 */
export const fetchStudentReports = async (studentId) => {
  const response = await apiClient.get(
    `${REPORTS_BASE_URL}student/${studentId}/`
  );
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  if (response.data?.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  return [];
};

/**
 * جلب تقارير جامعة محددة
 * GET /api/v1/reports/university/<university_id>/
 */
export const fetchUniversityReports = async (universityId) => {
  const response = await apiClient.get(
    `${REPORTS_BASE_URL}university/${universityId}/`
  );
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  if (response.data?.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  return [];
};















