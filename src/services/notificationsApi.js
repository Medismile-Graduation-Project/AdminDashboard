import apiClient from "./api";

/**
 * API service للإشعارات (Notifications)
 * بناءً على التوثيق المقدم من Backend
 */

const NOTIFICATIONS_BASE_URL = "/notifications/";

/**
 * جلب جميع الإشعارات
 * GET /api/v1/notifications/
 * Query Parameters: recipient_id, sender_id, status, is_read, type, appointment_id, page, page_size
 */
export const fetchNotifications = async (params = {}) => {
  try {
    // تحويل notification_type إلى type إذا كان موجوداً
    const queryParams = { ...params };
    if (queryParams.notification_type) {
      queryParams.type = queryParams.notification_type;
      delete queryParams.notification_type;
    }
    
    console.log("🔔 Fetching notifications with params:", queryParams);
    console.log("🔔 API Base URL:", apiClient.defaults.baseURL);
    console.log("🔔 Full URL:", `${apiClient.defaults.baseURL}${NOTIFICATIONS_BASE_URL}`);
    
    const response = await apiClient.get(NOTIFICATIONS_BASE_URL, { params: queryParams });
    
    console.log("🔔 Notifications API Response:", response.data);
    
    // الاستجابة قد تأتي بصيغ مختلفة:
    // 1. Pagination format: { count, next, previous, results: [...] }
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      console.log("🔔 Found notifications in results:", response.data.results.length);
      return response.data.results;
    }
    
    // 2. Direct data format: { data: [...] }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log("🔔 Found notifications in data:", response.data.data.length);
      return response.data.data;
    }
    
    // 3. Direct array
    if (Array.isArray(response.data)) {
      console.log("🔔 Found notifications as direct array:", response.data.length);
      return response.data;
    }
    
    console.warn("🔔 No notifications found in response");
    return [];
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    console.error("❌ Error response:", error?.response?.data);
    console.error("❌ Error status:", error?.response?.status);
    throw error;
  }
};

/**
 * جلب إشعار محدد (يتم تعليمه كمقروء تلقائياً)
 * GET /api/v1/notifications/<notification_id>/
 */
export const fetchNotificationById = async (id) => {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}${id}/`);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching notification:", error);
    throw error;
  }
};

/**
 * إنشاء إشعار جديد
 * POST /api/v1/notifications/
 * Body: { notification_type, appointment_id, recipient_id, sender_id?, title, message, proposed_changes? }
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await apiClient.post(NOTIFICATIONS_BASE_URL, notificationData);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * تحديث إشعار (قبول/رفض)
 * PUT /api/v1/notifications/<notification_id>/
 * Body: { status: 'accepted' | 'rejected', response_message?: string }
 */
export const updateNotification = async (id, updateData) => {
  try {
    const response = await apiClient.put(`${NOTIFICATIONS_BASE_URL}${id}/`, updateData);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
};

/**
 * تحديث جزئي لإشعار
 * PATCH /api/v1/notifications/<notification_id>/
 */
export const patchNotification = async (id, updateData) => {
  try {
    const response = await apiClient.patch(`${NOTIFICATIONS_BASE_URL}${id}/`, updateData);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error patching notification:", error);
    throw error;
  }
};

/**
 * حذف إشعار
 * DELETE /api/v1/notifications/<notification_id>/delete/
 */
export const deleteNotification = async (id) => {
  try {
    await apiClient.delete(`${NOTIFICATIONS_BASE_URL}${id}/delete/`);
    return id;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * تبديل حالة القراءة لإشعار
 * POST /api/v1/notifications/<notification_id>/toggle-read/
 */
export const toggleNotificationRead = async (id) => {
  try {
    const response = await apiClient.post(`${NOTIFICATIONS_BASE_URL}${id}/toggle-read/`);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error toggling notification read status:", error);
    throw error;
  }
};

/**
 * جلب عدد الإشعارات غير المقروءة
 * GET /api/v1/notifications/unread-count/
 * Query Parameters: recipient_id
 */
export const fetchUnreadCount = async (params = {}) => {
  try {
    console.log("🔔 Fetching unread count with params:", params);
    const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}unread-count/`, { params });
    
    console.log("🔔 Unread count response:", response.data);
    
    if (response.data && response.data.count !== undefined) {
      return response.data.count;
    }
    
    if (response.data && response.data.data && response.data.data.count !== undefined) {
      return response.data.data.count;
    }
    
    // إذا كانت الاستجابة رقم مباشر
    if (typeof response.data === 'number') {
      return response.data;
    }
    
    return 0;
  } catch (error) {
    console.error("❌ Error fetching unread count:", error);
    console.error("❌ Error response:", error?.response?.data);
    // في حالة الخطأ، نعيد 0 بدلاً من throw error
    return 0;
  }
};

/**
 * تعليم جميع الإشعارات كمقروءة
 * POST /api/v1/notifications/mark-all-read/
 * Body: { recipient_id?: UUID }
 */
export const markAllNotificationsAsRead = async (data = {}) => {
  try {
    const response = await apiClient.post(`${NOTIFICATIONS_BASE_URL}mark-all-read/`, data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * طلب تحديث موعد
 * POST /api/v1/notifications/appointments/<appointment_id>/request-update/
 * Body: { user_id, proposed_changes, message?, title? }
 */
export const requestAppointmentUpdate = async (appointmentId, requestData) => {
  try {
    const response = await apiClient.post(
      `${NOTIFICATIONS_BASE_URL}appointments/${appointmentId}/request-update/`,
      requestData
    );
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error requesting appointment update:", error);
    throw error;
  }
};

/**
 * طلب إلغاء موعد
 * POST /api/v1/notifications/appointments/<appointment_id>/request-cancel/
 * Body: { user_id, message?, title? }
 */
export const requestAppointmentCancel = async (appointmentId, requestData) => {
  try {
    const response = await apiClient.post(
      `${NOTIFICATIONS_BASE_URL}appointments/${appointmentId}/request-cancel/`,
      requestData
    );
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error requesting appointment cancel:", error);
    throw error;
  }
};

/**
 * تحديث FCM Token
 * POST /api/v1/notifications/fcm-token/
 * Body: { user_id, fcm_token }
 */
export const updateFcmToken = async (fcmData) => {
  try {
    const response = await apiClient.post(`${NOTIFICATIONS_BASE_URL}fcm-token/`, fcmData);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error updating FCM token:", error);
    throw error;
  }
};
