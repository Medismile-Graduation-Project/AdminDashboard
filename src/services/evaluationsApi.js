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
 * GET /api/evaluations/<id>/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - مسؤول الجامعة: يمكنه عرض تقييمات طلاب جامعته فقط
 *   (Backend يتحقق تلقائياً من أن التقييم يخص جامعته)
 * 
 * @param {string} evaluationId - ID التقييم
 * يعيد: Evaluation object
 */
export const fetchEvaluationById = async (evaluationId) => {
  try {
    const response = await apiClient.get(`${EVALUATIONS_BASE_URL}${evaluationId}/`);
    
    // الاستجابة قد تأتي بصيغة {data: {...}}
    if (response.data?.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching evaluation by ID:", error);
    }
    throw error;
  }
};

/**
 * إنشاء تقييم جديد (النظام الجديد حسب التوثيق)
 * POST /api/v1/evaluations/
 * @param {Object} evaluationData - بيانات التقييم
 * {
 *   student_id: string (uuid, required),
 *   target_type: string (required) - "case" | "session" | "appointment",
 *   case_id?: string (uuid, required if target_type === "case"),
 *   session_id?: string (uuid, required if target_type === "session"),
 *   appointment_id?: string (uuid, required if target_type === "appointment"),
 *   score: number (0-100, required),
 *   rubric?: object (JSON),
 *   comment?: string (nullable)
 * }
 */
export const createEvaluation = async (evaluationData) => {
  const response = await apiClient.post(EVALUATIONS_BASE_URL, evaluationData);
  return response.data?.data || response.data;
};

/**
 * تحديث تقييم (فقط المسودات)
 * PATCH /api/v1/evaluations/<evaluation_id>/
 */
export const updateEvaluation = async (evaluationId, evaluationData) => {
  const response = await apiClient.patch(`${EVALUATIONS_BASE_URL}${evaluationId}/`, evaluationData);
  return response.data?.data || response.data;
};

/**
 * جلب إحصائيات التقييمات لطالب محدد
 * GET /api/evaluations/students/<student_id>/statistics/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - مسؤول الجامعة: يمكنه عرض إحصائيات طلاب جامعته فقط
 *   (Backend يتحقق تلقائياً من أن الطالب يخص جامعته)
 * 
 * @param {string} studentId - ID الطالب
 * يعيد: Statistics object (مثل: {average_score, total_evaluations, ...})
 */
export const fetchStudentStatistics = async (studentId) => {
  try {
    const response = await apiClient.get(
      `${EVALUATIONS_BASE_URL}students/${studentId}/statistics/`
    );
    
    // الاستجابة قد تأتي بصيغة {data: {...}}
    if (response.data?.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching student statistics:", error);
    }
    throw error;
  }
};

/**
 * @deprecated استخدم fetchStudentStatistics بدلاً منها
 * جلب متوسط تقييمات طالب معين (قديم)
 * GET /api/v1/evaluations/students/<uuid:student_id>/average-ratings/
 */
export const fetchStudentAverageRatings = async (studentId) => {
  // إعادة توجيه للـ endpoint الجديد
  return fetchStudentStatistics(studentId);
};

/**
 * تقديم تقييم (Submit) - نقل من draft إلى submitted
 * POST /api/v1/evaluations/<evaluation_id>/submit/
 */
export const submitEvaluation = async (evaluationId) => {
  const response = await apiClient.post(`${EVALUATIONS_BASE_URL}${evaluationId}/submit/`);
  return response.data?.data || response.data;
};

/**
 * تثبيت تقييم (Finalize) - نقل من submitted إلى final
 * POST /api/v1/evaluations/<evaluation_id>/finalize/
 */
export const finalizeEvaluation = async (evaluationId) => {
  const response = await apiClient.post(`${EVALUATIONS_BASE_URL}${evaluationId}/finalize/`);
  return response.data?.data || response.data;
};





















