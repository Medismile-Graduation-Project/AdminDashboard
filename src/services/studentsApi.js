import apiClient from "./api";

/**
 * API service للطلاب (Students)
 * بناءً على التوثيق الكامل لـ API
 */

const STUDENTS_BASE_URL = "/accounts/students/";

/**
 * جلب جميع الطلاب
 * GET /api/v1/accounts/students/
 * يعيد: {status: "success", message: "...", data: [...]}
 */
export const fetchStudents = async () => {
  const response = await apiClient.get(STUDENTS_BASE_URL);
  
  let studentsData = [];
  
  // الاستجابة تأتي بصيغة {status: "success", message: "...", data: [...]}
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    studentsData = response.data.data;
  } else if (Array.isArray(response.data)) {
    // في حالة كانت البيانات مباشرة بدون غلاف
    studentsData = response.data;
  }
  
  return studentsData;
};

/**
 * جلب تفاصيل طالب محدد
 * GET /api/v1/accounts/students/{user_id}/
 * يعيد: {status: "success", message: "...", data: {...}}
 */
export const fetchStudentById = async (userId) => {
  const response = await apiClient.get(`${STUDENTS_BASE_URL}${userId}/`);
  
  // الاستجابة تأتي بصيغة {status: "success", message: "...", data: {...}}
  return response.data?.data || response.data;
};

/**
 * تحديث بيانات طالب
 * PATCH /api/v1/accounts/students/{user_id}/update/
 * يعيد: {status: "success", message: "...", data: {...}}
 * @param {string} userId - ID الطالب
 * @param {Object} studentData - بيانات الطالب المحدثة
 * {
 *   phone_number?: string,
 *   address?: string,
 *   date_of_birth?: string (YYYY-MM-DD),
 *   gender?: string (male/female),
 *   profile_picture?: string,
 *   university?: string (uuid),
 *   student_id?: string,
 *   year_of_study?: number (1-5),
 *   specialization?: string
 * }
 */
export const updateStudent = async (userId, studentData) => {
  const response = await apiClient.patch(`${STUDENTS_BASE_URL}${userId}/update/`, studentData);
  
  // الاستجابة تأتي بصيغة {status: "success", message: "...", data: {...}}
  return response.data?.data || response.data;
};

/**
 * إنشاء طالب جديد
 * POST /api/v1/accounts/students/create/
 * يعيد: {status: "success", message: "...", data: {...}}
 * @param {Object} studentData - بيانات الطالب الجديد
 * {
 *   username: string (مطلوب),
 *   email: string (مطلوب),
 *   password: string (مطلوب),
 *   password_confirm: string (مطلوب),
 *   first_name: string (مطلوب),
 *   last_name: string (مطلوب),
 *   university_id?: string (uuid, اختياري),
 *   student_id?: string (اختياري),
 *   year_of_study?: number (1-5, اختياري),
 *   specialization?: string (اختياري)
 * }
 */
export const createStudent = async (studentData) => {
  const response = await apiClient.post(`${STUDENTS_BASE_URL}create/`, studentData);
  
  // الاستجابة تأتي بصيغة {status: "success", message: "...", data: {...}}
  return response.data?.data || response.data;
};

/**
 * حذف طالب
 * DELETE /api/v1/accounts/students/{user_id}/delete/
 * يعيد: {status: "success", message: "..."}
 * @param {string} userId - ID الطالب
 */
export const deleteStudent = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required for deletion");
  }
  
  await apiClient.delete(`${STUDENTS_BASE_URL}${userId}/delete/`);
  return userId;
};


