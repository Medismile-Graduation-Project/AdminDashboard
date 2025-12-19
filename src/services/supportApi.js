import apiClient from "./api";

/**
 * جلب قائمة طلبات الدعم
 */
export const fetchSupportTickets = async (params = {}) => {
  const response = await apiClient.get("/support/tickets/", { params });
  return response.data.data;
};

/**
 * إنشاء طلب دعم جديد
 */
export const createSupportTicket = async (ticketData) => {
  const response = await apiClient.post("/support/tickets/", ticketData);
  return response.data.data;
};

/**
 * جلب تفاصيل طلب دعم
 */
export const fetchSupportTicketById = async (ticketId) => {
  const response = await apiClient.get(`/support/tickets/${ticketId}/`);
  return response.data.data;
};

/**
 * تحديث طلب دعم (للدعم التقني فقط)
 */
export const updateSupportTicket = async (ticketId, ticketData) => {
  const response = await apiClient.put(`/support/tickets/${ticketId}/`, ticketData);
  return response.data.data;
};

/**
 * تحديث جزئي لطلب دعم
 */
export const patchSupportTicket = async (ticketId, ticketData) => {
  const response = await apiClient.patch(`/support/tickets/${ticketId}/`, ticketData);
  return response.data.data;
};

/**
 * جلب ردود طلب دعم
 */
export const fetchTicketResponses = async (ticketId) => {
  const response = await apiClient.get(`/support/tickets/${ticketId}/responses/`);
  return response.data.data;
};

/**
 * إضافة رد على طلب دعم
 */
export const addTicketResponse = async (ticketId, responseData) => {
  const response = await apiClient.post(`/support/tickets/${ticketId}/responses/`, responseData);
  return response.data.data;
};

/**
 * جلب إحصائيات طلبات الدعم (للدعم التقني فقط)
 */
export const fetchSupportStats = async () => {
  const response = await apiClient.get("/support/stats/");
  return response.data.data;
};







