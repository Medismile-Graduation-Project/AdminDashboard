import apiClient from "./api";

/**
 * API service للحالات السريرية (Clinical Cases)
 * يتوافق مع Django REST Framework endpoints
 */

const CASES_BASE_URL = "/cases/";

/**
 * جلب جميع الحالات السريرية
 * GET /api/v1/cases/
 * يعيد: Array of Case objects أو {status: "success", data: [...]}
 */
export const fetchCases = async () => {
  const response = await apiClient.get(CASES_BASE_URL);
  
  // الاستجابة قد تأتي بصيغة {status: "success", message: "...", data: [...]}
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  // أو مباشرة كـ array
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
};

/**
 * جلب حالة سريرية محددة
 * GET /api/v1/cases/<uuid:pk>/
 * يعيد: Case object أو {status: "success", data: {...}}
 */
export const fetchCaseById = async (caseId) => {
  const response = await apiClient.get(`${CASES_BASE_URL}${caseId}/`);
  
  // الاستجابة قد تأتي بصيغة {status: "success", data: {...}}
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

/**
 * إنشاء حالة سريرية جديدة
 * POST /api/v1/cases/
 * @param {Object} caseData - بيانات الحالة { title, description, priority, is_public }
 * يعيد: Case object أو {status: "success", data: {...}}
 */
export const createCase = async (caseData) => {
  const response = await apiClient.post(CASES_BASE_URL, caseData);
  
  // الاستجابة قد تأتي بصيغة {status: "success", data: {...}}
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

/**
 * تحديث حالة سريرية
 * PATCH /api/v1/cases/<uuid:pk>/
 * @param {string} caseId - UUID للحالة
 * @param {Object} caseData - بيانات الحالة المحدثة { title, description, status, priority, is_public }
 * يعيد: Case object محدث أو {status: "success", data: {...}}
 */
export const updateCase = async (caseId, caseData) => {
  const response = await apiClient.patch(`${CASES_BASE_URL}${caseId}/`, caseData);
  
  // الاستجابة قد تأتي بصيغة {status: "success", data: {...}}
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

/**
 * حذف حالة سريرية
 * DELETE /api/v1/cases/<uuid:pk>/
 * @param {string} caseId - UUID للحالة
 */
export const deleteCase = async (caseId) => {
  await apiClient.delete(`${CASES_BASE_URL}${caseId}/`);
  return caseId;
};

/**
 * جلب طلبات الإسناد لحالة محددة
 * GET /api/v1/cases/<case_id>/assignment-requests/
 * @param {string} caseId - UUID للحالة
 */
export const fetchAssignmentRequests = async (caseId) => {
  const response = await apiClient.get(`${CASES_BASE_URL}${caseId}/assignment-requests/`);
  
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
};

/**
 * إنشاء طلب إسناد لحالة
 * POST /api/v1/cases/<case_id>/assignment-requests/
 * @param {string} caseId - UUID للحالة
 * @param {Object} requestData - { message?: string, student_id?: string }
 * ملاحظة: حسب CaseAssignmentRequestCreateSerializer، الحقول: case, message, student_id
 */
export const createAssignmentRequest = async (caseId, requestData = {}) => {
  // إضافة case_id إلى البيانات المرسلة
  const payload = {
    case: caseId,
    ...requestData,
  };
  
  const response = await apiClient.post(`${CASES_BASE_URL}${caseId}/assignment-requests/`, payload);
  
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

/**
 * طلب إسناد بديل (Function View)
 * POST /api/v1/cases/<case_id>/request-assign/
 * @param {string} caseId - UUID للحالة
 * @param {Object} requestData - { message?: string }
 */
export const requestCaseAssignment = async (caseId, requestData = {}) => {
  // حسب CaseAssignmentRequestCreateSerializer، الحقول: case, message, student_id
  // إضافة case_id إلى البيانات المرسلة
  const payload = {
    case: caseId,
    ...requestData,
  };
  
  const response = await apiClient.post(`${CASES_BASE_URL}${caseId}/request-assign/`, payload);
  
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

/**
 * جلب تفاصيل طلب إسناد
 * GET /api/v1/cases/assignment-requests/<request_id>/
 * @param {string} requestId - UUID لطلب الإسناد
 */
export const fetchAssignmentRequestById = async (requestId) => {
  const response = await apiClient.get(`${CASES_BASE_URL}assignment-requests/${requestId}/`);
  
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

/**
 * تحديث طلب إسناد
 * PUT/PATCH /api/v1/cases/assignment-requests/<request_id>/
 * @param {string} requestId - UUID لطلب الإسناد
 * @param {Object} requestData - { status?: string, message?: string }
 */
export const updateAssignmentRequest = async (requestId, requestData) => {
  // حسب CaseAssignmentRequestUpdateSerializer، الحقول: status, supervisor_response
  const response = await apiClient.patch(`${CASES_BASE_URL}assignment-requests/${requestId}/`, requestData);
  
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

/**
 * إجراء المشرف (قبول/رفض طلب إسناد)
 * POST /api/v1/cases/<case_id>/supervisor-action/
 * @param {string} caseId - UUID للحالة
 * @param {Object} actionData - { action: "accept" | "reject", student_id: string, message?: string, user_id?: string }
 */
export const supervisorCaseAction = async (caseId, actionData) => {
  const response = await apiClient.post(`${CASES_BASE_URL}${caseId}/supervisor-action/`, actionData);
  
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return response.data;
};

