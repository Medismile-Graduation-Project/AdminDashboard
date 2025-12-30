import apiClient from "./api";

/**
 * 🔕 API service للإشعارات (Notifications) - معلق مؤقتاً
 * بناءً على التوثيق المقدم من Backend
 */

const NOTIFICATIONS_BASE_URL = "/notifications/";

/**
 * جلب جميع الإشعارات (Inbox للمستلم)
 * GET /api/notifications/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - ماذا يعيد: كل الإشعارات التي يكون فيها recipient = university_admin
 * - Backend يفلتر تلقائياً حسب المستخدم المسجل من Token
 * 
 * Query Parameters (اختيارية):
 * - recipient_id: معرف المستلم
 * - sender_id: معرف المرسل
 * - status: حالة الإشعار
 * - is_read: حالة القراءة (true/false)
 * - type: نوع الإشعار
 * - appointment_id: معرف الموعد
 * - page: رقم الصفحة (للـ pagination)
 * - page_size: حجم الصفحة (للـ pagination)
 */
// export const fetchNotifications = async (params = {}) => {
//   try {
//     // تحويل notification_type إلى type إذا كان موجوداً
//     const queryParams = { ...params };
//     if (queryParams.notification_type) {
//       queryParams.type = queryParams.notification_type;
//       delete queryParams.notification_type;
//     }
//     
//     // فقط في development mode نطبع logs
//     if (process.env.NODE_ENV === "development") {
//       console.log("🔔 Fetching notifications with params:", queryParams);
//     }
//     
//     const response = await apiClient.get(NOTIFICATIONS_BASE_URL, { params: queryParams });
//     
//     // الاستجابة قد تأتي بصيغ مختلفة:
//     // 1. Pagination format: { count, next, previous, results: [...] }
//     if (response.data && response.data.results && Array.isArray(response.data.results)) {
//       if (process.env.NODE_ENV === "development") {
//         console.log("🔔 Found notifications in results:", response.data.results.length);
//       }
//       return response.data.results;
//     }
//     
//     // 2. Direct data format: { data: [...] }
//     if (response.data && response.data.data && Array.isArray(response.data.data)) {
//       if (process.env.NODE_ENV === "development") {
//         console.log("🔔 Found notifications in data:", response.data.data.length);
//       }
//       return response.data.data;
//     }
//     
//     // 3. Direct array
//     if (Array.isArray(response.data)) {
//       if (process.env.NODE_ENV === "development") {
//         console.log("🔔 Found notifications as direct array:", response.data.length);
//       }
//       return response.data;
//     }
//     
//     if (process.env.NODE_ENV === "development") {
//       console.warn("🔔 No notifications found in response");
//     }
//     return [];
//   } catch (error) {
//     // فقط في development mode نطبع errors
//     if (process.env.NODE_ENV === "development") {
//       console.error("❌ Error fetching notifications:", error);
//       console.error("❌ Error response:", error?.response?.data);
//       console.error("❌ Error status:", error?.response?.status);
//     }
//     throw error;
//   }
// };

/**
 * 🔕 معلق مؤقتاً
 * جلب إشعار محدد
 * GET /api/notifications/<id>/
 * الصلاحيات: IsAuthenticated
 * الاستجابة: Notification كامل مع sender/recipient مختصرين
 */
// export const fetchNotificationById = async (id) => {
//   try {
//     const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}${id}/`);
//     
//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching notification:", error);
//     throw error;
//   }
// };

/**
 * 🔕 معلق مؤقتاً
 * إنشاء إشعار جديد
 * POST /api/notifications/
 * الصلاحيات: IsAuthenticated
 * Body: {
 *   notification_type: string (مطلوب),
 *   priority: string (مطلوب),
 *   recipient_id: number (مطلوب),
 *   appointment_id?: number (اختياري - إذا كان الإشعار متعلق بموعد),
 *   target_type?: string (اختياري - إذا لم يكن appointment_id),
 *   target_id?: number (اختياري - إذا لم يكن appointment_id),
 *   title: string (مطلوب),
 *   message: string (مطلوب),
 *   proposed_changes?: object (اختياري)
 * }
 */
// export const createNotification = async (notificationData) => {
//   try {
//     const response = await apiClient.post(NOTIFICATIONS_BASE_URL, notificationData);
//     
//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     
//     return response.data;
//   } catch (error) {
//     console.error("Error creating notification:", error);
//     throw error;
//   }
// };

/**
 * 🔕 معلق مؤقتاً
 * تحديث إشعار (mark read/accept/reject)
 * PATCH /api/notifications/<id>/
 * الصلاحيات: IsAuthenticated
 * Body: {
 *   status?: "accepted" | "rejected" | "pending" | "info",
 *   response_message?: string,
 *   is_read?: boolean
 * }
 * الاستجابة (200): Notification كامل مع sender/recipient مختصرين
 */
// export const updateNotification = async (id, updateData) => {
//   try {
//     const response = await apiClient.patch(`${NOTIFICATIONS_BASE_URL}${id}/`, updateData);
//     
//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     
//     return response.data;
//   } catch (error) {
//     console.error("Error updating notification:", error);
//     throw error;
//   }
// };

/**
 * 🔕 معلق مؤقتاً
 * حذف إشعار
 * DELETE /api/notifications/<notification_id>/actions/delete/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - الاستجابة: { "message": "Notification deleted" }
 */
// export const deleteNotification = async (id) => {
//   try {
//     await apiClient.delete(`${NOTIFICATIONS_BASE_URL}${id}/actions/delete/`);
//     return id;
//   } catch (error) {
//     console.error("Error deleting notification:", error);
//     throw error;
//   }
// };

/**
 * 🔕 معلق مؤقتاً
 * تبديل حالة القراءة لإشعار
 * POST /api/notifications/<notification_id>/actions/toggle-read/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - الاستجابة: { status: "success", data: {...} }
 */
// export const toggleNotificationRead = async (id) => {
//   try {
//     const response = await apiClient.post(`${NOTIFICATIONS_BASE_URL}${id}/actions/toggle-read/`);
//     
//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     
//     return response.data;
//   } catch (error) {
//     console.error("Error toggling notification read status:", error);
//     throw error;
//   }
// };

/**
 * 🔕 معلق مؤقتاً
 * جلب عدد الإشعارات غير المقروءة
 * GET /api/notifications/actions/unread-count/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - الاستجابة: { "unread_count": 5 }
 * 
 * @param {Object} params - Query parameters (اختياري)
 * @returns {number} عدد الإشعارات غير المقروءة
 */
// export const fetchUnreadCount = async (params = {}) => {
//   try {
//     if (process.env.NODE_ENV === "development") {
//       console.log("🔔 Fetching unread count with params:", params);
//     }
//     const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}actions/unread-count/`, { params });
//     
//     if (process.env.NODE_ENV === "development") {
//       console.log("🔔 Unread count response:", response.data);
//     }
//     
//     // حسب التوثيق: { "unread_count": 5 }
//     if (response.data && response.data.unread_count !== undefined) {
//       return response.data.unread_count;
//     }
//     
//     // صيغ بديلة محتملة
//     if (response.data && response.data.count !== undefined) {
//       return response.data.count;
//     }
//     
//     if (response.data && response.data.data && response.data.data.unread_count !== undefined) {
//       return response.data.data.unread_count;
//     }
//     
//     // إذا كانت الاستجابة رقم مباشر
//     if (typeof response.data === 'number') {
//       return response.data;
//     }
//     
//     return 0;
//   } catch (error) {
//     // فقط في development mode نطبع errors
//     if (process.env.NODE_ENV === "development") {
//       console.error("❌ Error fetching unread count:", error);
//       console.error("❌ Error response:", error?.response?.data);
//     }
//     // في حالة الخطأ، نعيد 0 بدلاً من throw error
//     return 0;
//   }
// };

/**
 * 🔕 معلق مؤقتاً
 * تعليم جميع الإشعارات كمقروءة
 * POST /api/notifications/actions/mark-all-read/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - الاستجابة: { "message": "All notifications marked as read" }
 */
// export const markAllNotificationsAsRead = async (data = {}) => {
//   try {
//     const response = await apiClient.post(`${NOTIFICATIONS_BASE_URL}actions/mark-all-read/`, data);
//     
//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     
//     return response.data;
//   } catch (error) {
//     console.error("Error marking all notifications as read:", error);
//     throw error;
//   }
// };

/**
 * 🔕 معلق مؤقتاً
 * تحديث FCM Token
 * POST /api/notifications/device/fcm-token/
 * 
 * حسب التوثيق:
 * - الصلاحيات: IsAuthenticated
 * - البيانات: { "fcm_token": "..." }
 */
// export const updateFcmToken = async (fcmData) => {
//   try {
//     const response = await apiClient.post(`${NOTIFICATIONS_BASE_URL}device/fcm-token/`, fcmData);
//     
//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     
//     return response.data;
//   } catch (error) {
//     console.error("Error updating FCM token:", error);
//     throw error;
//   }
// };
