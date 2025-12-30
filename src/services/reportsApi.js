import apiClient from "./api";

/**
 * API service للتقارير (Reports)
 * بناءً على التوثيق الكامل لـ Reports API
 */

const REPORTS_BASE_URL = "/reports/";

/**
 * جلب قائمة التقارير
 * GET /api/reports/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated + Bearer Token (role = university_admin)
 * - مسؤول الجامعة (university_admin): يرى فقط تقارير جامعته
 *   ⚠️ مهم: Backend يتحقق تلقائياً من university_id من Token
 *   ⚠️ لا يجب تمرير university_id كـ query parameter - Backend يستخرجه من Token
 * - tech_support: يرى جميع التقارير
 * 
 * Query Parameters (اختيارية):
 * - student_id: معرف الطالب
 * - report_type: نوع التقرير (academic, clinical, progress, summary)
 * - is_active: حالة التقرير (true/false)
 * 
 * ⚠️ ملاحظة مهمة: لا تمرر university_id في params - Backend يتحقق تلقائياً من Token
 * 
 * يعيد: Array of report objects (مفلترة تلقائياً حسب جامعة المستخدم)
 */
export const fetchReports = async (params = {}) => {
  try {
    // ⚠️ لا تمرر university_id - Backend يستخرجه من Token تلقائياً
    // إزالة university_id من params إذا كان موجوداً (للتأكد)
    const { university_id, ...cleanParams } = params;
    
    const response = await apiClient.get(REPORTS_BASE_URL, { params: cleanParams });
    
    // الاستجابة قد تأتي بصيغ مختلفة:
    // 1. Array مباشر
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // 2. {results: [...]} (pagination)
    if (response.data?.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    // 3. {data: [...]}
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    if (process.env.NODE_ENV === "development") {
      console.warn("Unexpected reports API response format:", response.data);
    }
    return [];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching reports:", error);
    }
    throw error;
  }
};

/**
 * جلب تقرير محدد
 * GET /api/reports/{id}/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated + Bearer Token (role = university_admin)
 * - مسؤول الجامعة: يمكنه عرض تقرير واحد فقط إذا كان التقرير تابعًا لجامعته
 *   ⚠️ مهم: Backend يتحقق تلقائياً من أن التقرير يخص جامعته من Token
 *   ⚠️ إذا حاول المستخدم الوصول لتقرير من جامعة أخرى، يعيد Backend خطأ 403/404
 * 
 * @param {string} id - ID التقرير (UUID)
 * @returns {Promise<Object>} Report object
 * @throws {Error} إذا كان التقرير لا يخص جامعة المستخدم أو غير موجود
 */
export const fetchReportById = async (id) => {
  try {
    const response = await apiClient.get(`${REPORTS_BASE_URL}${id}/`);
    
    // الاستجابة قد تأتي بصيغة {data: {...}}
    if (response.data?.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching report by ID:", error);
    }
    throw error;
  }
};

/**
 * إنشاء تقرير جديد
 * POST /api/reports/
 * 
 * حسب التوثيق:
 * - الصلاحيات: فقط المشرفين/المسؤولين يمكنهم إنشاء التقارير
 * - الحقول: student_id, report_type, title, description, file_url, is_active
 */
export const createReport = async (data) => {
  try {
    const response = await apiClient.post(REPORTS_BASE_URL, data);
    
    // الاستجابة قد تأتي بصيغة {data: {...}}
    if (response.data?.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating report:", error);
    }
    throw error;
  }
};

/**
 * تحديث تقرير
 * PATCH /api/reports/<report_id>/
 * 
 * ملاحظة: حسب التوثيق، التقارير غير قابلة للتعديل بعد الإنشاء (Immutable)
 * لكن API قد يدعم soft delete (is_active)
 */
export const updateReport = async (id, data) => {
  try {
    const response = await apiClient.patch(`${REPORTS_BASE_URL}${id}/`, data);
    
    if (response.data?.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating report:", error);
    }
    throw error;
  }
};

/**
 * حذف تقرير (Soft Delete)
 * DELETE /api/reports/<report_id>/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - يتم إخفاء التقرير (is_active = False) بدلاً من الحذف الفعلي
 */
export const deleteReport = async (id) => {
  try {
    await apiClient.delete(`${REPORTS_BASE_URL}${id}/`);
    return id;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting report:", error);
    }
    throw error;
  }
};

/**
 * جلب تقارير طالب محدد
 * GET /api/reports/student/<student_id>/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 */
export const fetchStudentReports = async (studentId) => {
  try {
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
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching student reports:", error);
    }
    throw error;
  }
};

/**
 * جلب تقارير جامعة محددة
 * GET /api/reports/university/<university_id>/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 */
export const fetchUniversityReports = async (universityId) => {
  try {
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
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching university reports:", error);
    }
    throw error;
  }
};















