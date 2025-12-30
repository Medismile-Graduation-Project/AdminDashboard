
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// 🔕 معلق مؤقتاً - جميع الـ endpoints معلقة
// import * as notificationsApi from "../../../services/notificationsApi";

/**
 * دالة مساعدة لاستخراج اسم المستخدم من User object
 */
const getUserName = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;
  
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  if (firstName) return firstName;
  if (user.username) return user.username;
  if (user.name) return user.name;
  if (user.email) return user.email;
  return "-";
};

/**
 * Mapping function لتحويل بيانات API إلى تنسيق مناسب للـ Frontend
 * بناءً على NotificationSerializer
 */
const mapNotificationFromApi = (apiNotification) => {
  if (!apiNotification) {
    return null;
  }
  
  const safeValue = (value, defaultValue = null) => {
    return value !== null && value !== undefined ? value : defaultValue;
  };
  
  return {
    id: safeValue(apiNotification.id),
    sender: safeValue(apiNotification.sender, null),
    sender_name: getUserName(apiNotification.sender),
    sender_id: apiNotification.sender?.id || apiNotification.sender || null,
    recipient: safeValue(apiNotification.recipient, null),
    recipient_name: getUserName(apiNotification.recipient),
    recipient_id: apiNotification.recipient?.id || apiNotification.recipient || null,
    notification_type: safeValue(apiNotification.notification_type, ""),
    appointment: safeValue(apiNotification.appointment, null),
    appointment_id: apiNotification.appointment?.id || apiNotification.appointment || null,
    // إضافة حقول للمحتوى والحالات
    content: safeValue(apiNotification.content, null),
    content_id: apiNotification.content?.id || apiNotification.content_id || null,
    case: safeValue(apiNotification.case, null),
    case_id: apiNotification.case?.id || apiNotification.case_id || null,
    student: safeValue(apiNotification.student, null),
    student_id: apiNotification.student?.id || apiNotification.student_id || null,
    title: safeValue(apiNotification.title, ""),
    message: safeValue(apiNotification.message, ""),
    status: safeValue(apiNotification.status, "pending"),
    response_message: safeValue(apiNotification.response_message, ""),
    proposed_changes: safeValue(apiNotification.proposed_changes, null),
    is_read: safeValue(apiNotification.is_read, false),
    created_at: safeValue(apiNotification.created_at, ""),
    updated_at: safeValue(apiNotification.updated_at, ""),
  };
};

/**
 * 🔕 معلق مؤقتاً
 * جلب جميع الإشعارات
 */
// export const fetchNotificationsAsync = createAsyncThunk(
//   "notifications/fetchNotifications",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // فقط في development mode نطبع logs
//       if (process.env.NODE_ENV === "development") {
//         console.log("🔔 Redux: Fetching notifications with params:", params);
//       }
//       const data = await notificationsApi.fetchNotifications(params);
//       if (process.env.NODE_ENV === "development") {
//         console.log("🔔 Redux: Received notifications data:", data);
//       }
//       const mapped = Array.isArray(data) ? data.map(mapNotificationFromApi) : [];
//       if (process.env.NODE_ENV === "development") {
//         console.log("🔔 Redux: Mapped notifications:", mapped.length);
//       }
//       return mapped;
//     } catch (error) {
//       // فقط في development mode نطبع errors
//       if (process.env.NODE_ENV === "development") {
//         console.error("❌ Redux: Error fetching notifications:", error);
//       }
//       const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || error?.message || "فشل في جلب الإشعارات";
//       if (process.env.NODE_ENV === "development") {
//         console.error("❌ Redux: Error message:", errorMessage);
//       }
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

/**
 * 🔕 معلق مؤقتاً
 * جلب إشعار محدد
 */
// export const fetchNotificationByIdAsync = createAsyncThunk(
//   "notifications/fetchNotificationById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const data = await notificationsApi.fetchNotificationById(id);
//       return mapNotificationFromApi(data);
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data?.message || error?.message || "فشل في جلب الإشعار"
//       );
//     }
//   }
// );

/**
 * 🔕 معلق مؤقتاً
 * إنشاء إشعار جديد
 */
// export const createNotificationAsync = createAsyncThunk(
//   "notifications/createNotification",
//   async (notificationData, { rejectWithValue }) => {
//     try {
//       const data = await notificationsApi.createNotification(notificationData);
//       return mapNotificationFromApi(data);
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data?.message || error?.response?.data?.errors || error?.message || "فشل في إنشاء الإشعار"
//       );
//     }
//   }
// );

/**
 * 🔕 معلق مؤقتاً
 * تحديث إشعار (mark read/accept/reject)
 * Body: { status?: "accepted"|"rejected"|"pending"|"info", response_message?: string, is_read?: boolean }
 */
// export const updateNotificationAsync = createAsyncThunk(
//   "notifications/updateNotification",
//   async ({ id, status, response_message, is_read }, { rejectWithValue }) => {
//     try {
//       const updateData = {};
//       if (status) updateData.status = status;
//       if (response_message) updateData.response_message = response_message;
//       if (is_read !== undefined) updateData.is_read = is_read;
//       
//       const data = await notificationsApi.updateNotification(id, updateData);
//       return mapNotificationFromApi(data);
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data?.message || error?.response?.data?.errors || error?.message || "فشل في تحديث الإشعار"
//       );
//     }
//   }
// );

/**
 * 🔕 معلق مؤقتاً
 * حذف إشعار
 */
// export const deleteNotificationAsync = createAsyncThunk(
//   "notifications/deleteNotification",
//   async (id, { rejectWithValue }) => {
//     try {
//       await notificationsApi.deleteNotification(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data?.message || error?.message || "فشل في حذف الإشعار"
//       );
//     }
//   }
// );

/**
 * 🔕 معلق مؤقتاً
 * تبديل حالة القراءة لإشعار
 */
// export const toggleNotificationReadAsync = createAsyncThunk(
//   "notifications/toggleNotificationRead",
//   async (id, { rejectWithValue }) => {
//     try {
//       const data = await notificationsApi.toggleNotificationRead(id);
//       return mapNotificationFromApi(data);
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data?.message || error?.message || "فشل في تبديل حالة القراءة"
//       );
//     }
//   }
// );

/**
 * 🔕 معلق مؤقتاً
 * جلب عدد الإشعارات غير المقروءة
 */
// export const fetchUnreadCountAsync = createAsyncThunk(
//   "notifications/fetchUnreadCount",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const count = await notificationsApi.fetchUnreadCount(params);
//       return count;
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data?.message || error?.message || "فشل في جلب عدد الإشعارات غير المقروءة"
//       );
//     }
//   }
// );

/**
 * 🔕 معلق مؤقتاً
 * تعليم جميع الإشعارات كمقروءة
 */
// export const markAllNotificationsAsReadAsync = createAsyncThunk(
//   "notifications/markAllNotificationsAsRead",
//   async (data = {}, { rejectWithValue }) => {
//     try {
//       await notificationsApi.markAllNotificationsAsRead(data);
//       return true;
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data?.message || error?.message || "فشل في تعليم جميع الإشعارات كمقروءة"
//       );
//     }
//   }
// );

const initialState = {
  notifications: [],
  selectedNotification: null,
  unreadCount: 0,
  loading: false,
  loadingSelected: false,
  error: null,
  filters: {
    recipient_id: null,
    sender_id: null,
    status: null,
    is_read: null,
    notification_type: null,
  },
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        recipient_id: null,
        sender_id: null,
        status: null,
        is_read: null,
        notification_type: null,
      };
    },
    setSelectedNotification: (state, action) => {
      state.selectedNotification = action.payload;
    },
    clearSelectedNotification: (state) => {
      state.selectedNotification = null;
    },
  },
  extraReducers: (builder) => {
    // 🔕 معلق مؤقتاً - جميع الـ async thunks معلقة
    // builder
    //   // fetchNotificationsAsync
    //   .addCase(fetchNotificationsAsync.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(fetchNotificationsAsync.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.notifications = action.payload;
    //   })
    //   .addCase(fetchNotificationsAsync.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload;
    //   })
    //   // ... باقي الـ cases معلقة
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setSelectedNotification,
  clearSelectedNotification,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
