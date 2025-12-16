import apiClient from "./api";

/**
 * API service للمواعيد (Appointments)
 * بناءً على Views من Backend
 */

const APPOINTMENTS_BASE_URL = "/appointments/";

/**
 * جلب جميع المواعيد
 * GET /api/v1/appointments/
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
    
    console.warn("Unexpected appointments API response format:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

























