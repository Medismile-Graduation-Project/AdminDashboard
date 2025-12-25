import apiClient from "./api";

/**
 * API service للمواعيد (Appointments)
 * بناءً على Views من Backend
 */

const APPOINTMENTS_BASE_URL = "/appointments/";

/**
 * جلب جميع المواعيد
 * GET /api/appointments/
 * Query Parameters: status, patient_id, user_id, case_id
 * يعيد: Array of appointments أو {status: "success", message: "...", data: [...]}
 */
export const fetchAppointments = async (params = {}) => {
  try {
    const response = await apiClient.get(APPOINTMENTS_BASE_URL, { params });
    
    // الاستجابة قد تأتي بصيغ مختلفة:
    // 1. {status: "success", message: "...", data: [...]}
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // 2. Array مباشر
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // 3. {results: [...]} (pagination)
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    if (process.env.NODE_ENV === "development") {
      console.warn("Unexpected appointments API response format:", response.data);
    }
    return [];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching appointments:", error);
    }
    throw error;
  }
};

/**
 * جلب تفاصيل موعد محدد
 * GET /api/appointments/<appointment_id>/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - مسؤول الجامعة: يمكنه عرض تفاصيل مواعيد جامعته
 */
export const fetchAppointmentById = async (appointmentId) => {
  try {
    const response = await apiClient.get(`${APPOINTMENTS_BASE_URL}${appointmentId}/`);
    
    // الاستجابة قد تأتي بصيغة {status: "success", data: {...}}
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching appointment by ID:", error);
    }
    throw error;
  }
};

























