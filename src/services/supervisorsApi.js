import apiClient from "./api";

/**
 * API service للمشرفين (Supervisors)
 * بناءً على التوثيق الكامل لـ API
 */

const SUPERVISORS_BASE_URL = "/accounts/supervisors/";

/**
 * جلب جميع المشرفين
 * GET /api/v1/accounts/supervisors/
 * يعيد: {status: "success", message: "...", data: [...]}
 */
export const fetchSupervisors = async () => {
  const response = await apiClient.get(SUPERVISORS_BASE_URL);
  
  let supervisorsData = [];
  
  // الاستجابة تأتي بصيغة {status: "success", message: "...", data: [...]}
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    supervisorsData = response.data.data;
  } else if (Array.isArray(response.data)) {
    supervisorsData = response.data;
  }
  
  return supervisorsData;
};

/**
 * جلب تفاصيل مشرف محدد
 * GET /api/v1/accounts/supervisors/{user_id}/
 * يعيد: {status: "success", message: "...", data: {...}}
 */
export const fetchSupervisorById = async (userId) => {
  const response = await apiClient.get(`${SUPERVISORS_BASE_URL}${userId}/`);
  
  return response.data?.data || response.data;
};

/**
 * إنشاء مشرف جديد
 * POST /api/v1/accounts/supervisors/create/
 * يعيد: {status: "success", message: "...", data: {...}}
 * @param {Object} supervisorData - بيانات المشرف الجديد
 * {
 *   username: string (مطلوب),
 *   email: string (مطلوب),
 *   password: string (مطلوب),
 *   password_confirm: string (مطلوب),
 *   first_name: string (مطلوب),
 *   last_name: string (مطلوب),
 *   university: string (uuid, مطلوب),
 *   department: string (اختياري),
 *   position: string (اختياري),
 *   license_number: string (اختياري)
 * }
 */
export const createSupervisor = async (supervisorData) => {
  const response = await apiClient.post(`${SUPERVISORS_BASE_URL}create/`, supervisorData);
  
  return response.data?.data || response.data;
};



