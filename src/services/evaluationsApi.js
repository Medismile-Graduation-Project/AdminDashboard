import apiClient from "./api";

/**
 * API service للتقييمات (Evaluations)
 * بناءً على التوثيق الكامل لـ API
 */

const EVALUATIONS_BASE_URL = "/evaluations/";

/**
 * جلب جميع التقييمات
 * GET /api/v1/evaluations/
 * Query Parameters:
 * - evaluator_type: نوع المقيم (patient, supervisor, student, university, admin)
 * - student_id: فلترة حسب الطالب الذي تم تقييمه
 * - patient_id: فلترة حسب المريض المرتبط بالتقييم
 * - appointment_id: فلترة حسب الموعد المرتبط بالتقييم
 */
export const fetchEvaluations = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.evaluator_type) {
    queryParams.append("evaluator_type", params.evaluator_type);
  }
  if (params.student_id) {
    queryParams.append("student_id", params.student_id);
  }
  if (params.patient_id) {
    queryParams.append("patient_id", params.patient_id);
  }
  if (params.appointment_id) {
    queryParams.append("appointment_id", params.appointment_id);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${EVALUATIONS_BASE_URL}?${queryString}` : EVALUATIONS_BASE_URL;
  
  const response = await apiClient.get(url);
  
  // الاستجابة تأتي كمصفوفة مباشرة
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
};

/**
 * جلب تفاصيل تقييم محدد
 * GET /api/v1/evaluations/<uuid:pk>/
 */
export const fetchEvaluationById = async (evaluationId) => {
  const response = await apiClient.get(`${EVALUATIONS_BASE_URL}${evaluationId}/`);
  return response.data;
};

/**
 * إنشاء تقييم جديد
 * POST /api/v1/evaluations/
 * @param {Object} evaluationData - بيانات التقييم
 * {
 *   patient_id?: string (uuid or null),
 *   student_id?: string (uuid or null),
 *   appointment_id?: string (uuid or null),
 *   rating: number (1-10, required),
 *   comment?: string (nullable),
 *   evaluator_type: string (required) - patient, supervisor, student, university, admin
 * }
 */
export const createEvaluation = async (evaluationData) => {
  const response = await apiClient.post(EVALUATIONS_BASE_URL, evaluationData);
  return response.data;
};

/**
 * جلب متوسط تقييمات طالب معين
 * GET /api/v1/evaluations/students/<uuid:student_id>/average-ratings/
 */
export const fetchStudentAverageRatings = async (studentId) => {
  const response = await apiClient.get(
    `${EVALUATIONS_BASE_URL}students/${studentId}/average-ratings/`
  );
  return response.data;
};





















