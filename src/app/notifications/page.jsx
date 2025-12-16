"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  RefreshCw,
  PlusCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Bell,
  Filter,
  X,
  Save,
  Loader2,
  Clock,
} from "lucide-react";
import {
  fetchNotificationsAsync,
  createNotificationAsync,
  updateNotificationAsync,
  deleteNotificationAsync,
  toggleNotificationReadAsync,
  fetchUnreadCountAsync,
  markAllNotificationsAsReadAsync,
  clearError,
  setFilters,
  clearFilters,
} from "../../redux/features/notifications/notificationsSlice";
import { fetchAppointmentsAsync } from "../../redux/features/appointments/appointmentsSlice";
import { fetchStudentsAsync } from "../../redux/features/students/studentsSlice";
import { approveContentAsync, rejectContentAsync } from "../../redux/features/mediContent/mediContentSlice";
import { supervisorCaseActionAsync } from "../../redux/features/clinicalCases/clinicalCasesSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Redux state
  const notificationsState = useSelector((state) => state.notifications);
  const notifications = notificationsState?.notifications || [];
  const unreadCount = notificationsState?.unreadCount || 0;
  const loading = notificationsState?.loading || false;
  const error = notificationsState?.error || null;
  const filters = notificationsState?.filters || {};

  // Appointments and Students for dropdowns
  const appointmentsState = useSelector((state) => state.appointments);
  const appointments = appointmentsState?.appointments || [];
  const studentsState = useSelector((state) => state.students);
  const students = studentsState?.students || [];

  // Current user
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReadStatus, setFilterReadStatus] = useState("all"); // all, read, unread
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, accepted, rejected
  const [filterType, setFilterType] = useState("all"); // all, appointment_request, appointment_change, etc.

  const [formData, setFormData] = useState({
    notification_type: "",
    appointment_id: "",
    recipient_id: "",
    title: "",
    message: "",
    proposed_changes: "",
  });

  // Fetch data on mount
  useEffect(() => {
    console.log("🔔 Notifications Page: User:", user);
    if (user?.id) {
      console.log("🔔 Notifications Page: Fetching notifications for user:", user.id);
      // جلب الإشعارات بدون recipient_id أولاً لرؤية جميع الإشعارات
      dispatch(fetchNotificationsAsync({}));
      dispatch(fetchUnreadCountAsync({}));
      dispatch(fetchAppointmentsAsync());
      dispatch(fetchStudentsAsync());
    } else {
      console.warn("🔔 Notifications Page: No user ID found, fetching all notifications");
      // حتى بدون user.id، نجرب جلب الإشعارات
      dispatch(fetchNotificationsAsync({}));
      dispatch(fetchUnreadCountAsync({}));
    }
  }, [user, dispatch]);

  // Debug: Log notifications when they change
  useEffect(() => {
    console.log("🔔 Notifications Page: Current notifications:", notifications);
    console.log("🔔 Notifications Page: Unread count:", unreadCount);
    console.log("🔔 Notifications Page: Loading:", loading);
    console.log("🔔 Notifications Page: Error:", error);
  }, [notifications, unreadCount, loading, error]);

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Format date
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (!n) return false;

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (n.title || "").toLowerCase().includes(searchLower) ||
      (n.message || "").toLowerCase().includes(searchLower) ||
      (n.sender_name || "").toLowerCase().includes(searchLower) ||
      (n.recipient_name || "").toLowerCase().includes(searchLower) ||
      (n.notification_type || "").toLowerCase().includes(searchLower);

    // Read status filter
    const matchesReadStatus =
      filterReadStatus === "all" ||
      (filterReadStatus === "read" && n.is_read) ||
      (filterReadStatus === "unread" && !n.is_read);

    // Status filter
    const matchesStatus =
      filterStatus === "all" || n.status === filterStatus;

    // Type filter
    const matchesType =
      filterType === "all" || n.notification_type === filterType;

    return matchesSearch && matchesReadStatus && matchesStatus && matchesType;
  });

  // Handle refresh
  const handleRefresh = () => {
    console.log("🔔 Refreshing notifications...");
    // جلب جميع الإشعارات (بدون فلترة recipient_id)
    dispatch(fetchNotificationsAsync({}));
    dispatch(fetchUnreadCountAsync({}));
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!window.confirm(t("Notifications.confirmMarkAllRead") || "هل تريد تعليم جميع الإشعارات كمقروءة؟")) {
      return;
    }
    try {
      await dispatch(markAllNotificationsAsReadAsync({ recipient_id: user?.id })).unwrap();
      toast.success(t("Notifications.markAllAsReadSuccess") || "تم تعليم جميع الإشعارات كمقروءة");
      handleRefresh();
    } catch (error) {
      toast.error(error || t("Notifications.markAllAsReadError") || "فشل في تعليم جميع الإشعارات كمقروءة");
    }
  };

  // Handle create notification
  const handleAdd = () => {
    setFormData({
      notification_type: "",
      appointment_id: "",
      recipient_id: "",
      title: "",
      message: "",
      proposed_changes: "",
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const notificationData = {
        notification_type: formData.notification_type,
        appointment_id: formData.appointment_id,
        recipient_id: formData.recipient_id,
        sender_id: user?.id, // مطلوب عند تعطيل المصادقة
        title: formData.title,
        message: formData.message,
      };
      if (formData.proposed_changes) {
        try {
          notificationData.proposed_changes = JSON.parse(formData.proposed_changes);
        } catch {
          notificationData.proposed_changes = formData.proposed_changes;
        }
      }
      await dispatch(createNotificationAsync(notificationData)).unwrap();
      toast.success(t("Notifications.createSuccess") || "تم إنشاء الإشعار بنجاح");
      setShowForm(false);
      handleRefresh();
    } catch (error) {
      toast.error(error || t("Notifications.createError") || "فشل في إنشاء الإشعار");
    }
  };

  // Handle accept/reject
  const handleAccept = async (notification) => {
    setShowResponseModal(notification);
    setResponseMessage("");
  };

  const handleReject = async (notification) => {
    setShowResponseModal(notification);
    setResponseMessage("");
  };

  const handleSubmitResponse = async (status) => {
    if (!showResponseModal) return;
    try {
      const notification = showResponseModal;
      
      // إذا كان إشعار موافقة على محتوى
      if (notification.notification_type === "content_approval_request" || notification.notification_type === "content_publish_request") {
        const contentId = notification.content_id || notification.content?.id;
        if (contentId && user?.id) {
          if (status === "accepted") {
            await dispatch(approveContentAsync({ contentId, userId: user.id })).unwrap();
            toast.success(t("Notifications.contentApproved") || "تم الموافقة على المحتوى بنجاح");
          } else {
            await dispatch(rejectContentAsync({ 
              contentId, 
              userId: user.id, 
              rejectionReason: responseMessage || undefined 
            })).unwrap();
            toast.success(t("Notifications.contentRejected") || "تم رفض المحتوى بنجاح");
          }
          // تحديث حالة الإشعار
          await dispatch(
            updateNotificationAsync({
              id: notification.id,
              status,
              response_message: responseMessage || undefined,
            })
          ).unwrap();
        }
      }
      // إذا كان إشعار إسناد حالة
      else if (notification.notification_type === "case_assignment_request") {
        const caseId = notification.case_id || notification.case?.id;
        const studentId = notification.student_id || notification.student?.id || notification.sender_id;
        if (caseId && studentId && user?.id) {
          await dispatch(
            supervisorCaseActionAsync({
              caseId,
              action: status === "accepted" ? "accept" : "reject",
              studentId,
              message: responseMessage || undefined,
              userId: user.id,
            })
          ).unwrap();
          // تحديث حالة الإشعار
          await dispatch(
            updateNotificationAsync({
              id: notification.id,
              status,
              response_message: responseMessage || undefined,
            })
          ).unwrap();
          toast.success(
            status === "accepted"
              ? t("Notifications.caseAssignmentAccepted") || "تم قبول إسناد الحالة بنجاح"
              : t("Notifications.caseAssignmentRejected") || "تم رفض إسناد الحالة بنجاح"
          );
        }
      }
      // إشعارات أخرى (مواعيد، إلخ)
      else {
        await dispatch(
          updateNotificationAsync({
            id: notification.id,
            status,
            response_message: responseMessage || undefined,
          })
        ).unwrap();
        toast.success(
          status === "accepted"
            ? t("Notifications.acceptSuccess") || "تم قبول الإشعار بنجاح"
            : t("Notifications.rejectSuccess") || "تم رفض الإشعار بنجاح"
        );
      }
      
      setShowResponseModal(null);
      setResponseMessage("");
      handleRefresh();
    } catch (error) {
      toast.error(error || t("Notifications.updateError") || "فشل في تحديث الإشعار");
    }
  };

  // Handle toggle read status
  const handleToggleRead = async (id) => {
    try {
      await dispatch(toggleNotificationReadAsync(id)).unwrap();
      handleRefresh();
    } catch (error) {
      toast.error(error || t("Notifications.toggleReadError") || "فشل في تبديل حالة القراءة");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm(t("Notifications.confirmDelete") || "هل أنت متأكد من حذف هذا الإشعار؟")) {
      return;
    }
    try {
      await dispatch(deleteNotificationAsync(id)).unwrap();
      toast.success(t("Notifications.deleteSuccess") || "تم حذف الإشعار بنجاح");
      handleRefresh();
    } catch (error) {
      toast.error(error || t("Notifications.deleteError") || "فشل في حذف الإشعار");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statuses = {
      pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-300", icon: Clock },
      accepted: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300", icon: CheckCircle },
      rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300", icon: XCircle },
    };
    const statusConfig = statuses[status] || statuses.pending;
    const Icon = statusConfig.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
      >
        <Icon size={14} />
        {t(`Notifications.statuses.${status}`) || status}
      </span>
    );
  };

  // Get type label
  const getTypeLabel = (type) => {
    return t(`Notifications.types.${type}`) || type || "-";
  };

  if (!mounted) {
    return <div className="p-4 min-h-screen bg-sky-50 dark:bg-slate-900"></div>;
  }

  const isRtl = i18n?.language === "ar";

  return (
    <AnimatedWrapper>
      <div className={`p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-[1300px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 dark:text-white">
                {t("Notifications.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("Notifications.description")}
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition"
              >
                <PlusCircle size={18} />
                <span className="hidden sm:inline">{t("Notifications.createNotification")}</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-xl transition"
                >
                  <CheckCircle size={18} />
                  <span className="hidden sm:inline">{t("Notifications.markAllAsRead") || "تعليم الكل كمقروء"}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{unreadCount}</span>
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl transition disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">{t("Notifications.refresh")}</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-sky-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("actions.search") || "بحث"}
                </label>
                <input
                  type="text"
                  placeholder={t("actions.searchPlaceholder") || "ابحث..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Read Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("Notifications.table.read") || "مقروء"}
                </label>
                <select
                  value={filterReadStatus}
                  onChange={(e) => setFilterReadStatus(e.target.value)}
                  className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">{t("Notifications.all")}</option>
                  <option value="read">{t("Notifications.read")}</option>
                  <option value="unread">{t("Notifications.unread")}</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("Notifications.table.status") || "الحالة"}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">{t("Notifications.all")}</option>
                  <option value="pending">{t("Notifications.pending")}</option>
                  <option value="accepted">{t("Notifications.accepted")}</option>
                  <option value="rejected">{t("Notifications.rejected")}</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("Notifications.table.type") || "النوع"}
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">{t("Notifications.all")}</option>
                  <option value="appointment_update_request">{t("Notifications.types.appointment_update_request") || "طلب تحديث موعد"}</option>
                  <option value="appointment_cancel_request">{t("Notifications.types.appointment_cancel_request") || "طلب إلغاء موعد"}</option>
                  <option value="appointment_confirmed">{t("Notifications.types.appointment_confirmed") || "تأكيد موعد"}</option>
                  <option value="appointment_cancelled">{t("Notifications.types.appointment_cancelled") || "إلغاء موعد"}</option>
                  <option value="appointment_completed">{t("Notifications.types.appointment_completed") || "اكتمال موعد"}</option>
                  <option value="content_approval_request">{t("Notifications.types.content_approval_request") || "طلب موافقة على محتوى"}</option>
                  <option value="content_publish_request">{t("Notifications.types.content_publish_request") || "طلب نشر محتوى"}</option>
                  <option value="case_assignment_request">{t("Notifications.types.case_assignment_request") || "طلب إسناد حالة"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-600 dark:border-red-500 rounded-xl text-red-600 dark:text-red-400">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => dispatch(clearError())} className="text-red-600 hover:text-red-600/80">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
            </div>
          )}

          {/* Notifications List */}
          {!loading && (
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-sky-200 dark:border-slate-700">
                  <Bell size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    {t("Notifications.noNotifications")}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 transition ${
                      notification.is_read
                        ? "border-sky-200 dark:border-slate-700"
                        : "border-blue-500 dark:border-blue-400"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {notification.title || "-"}
                              </h3>
                              {getStatusBadge(notification.status)}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">
                              {notification.message || "-"}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <span>
                                <strong>{t("Notifications.table.type")}:</strong> {getTypeLabel(notification.notification_type)}
                              </span>
                              {notification.sender_name && (
                                <span>
                                  <strong>{t("Notifications.table.sender")}:</strong> {notification.sender_name}
                                </span>
                              )}
                              {notification.recipient_name && (
                                <span>
                                  <strong>{t("Notifications.table.recipient")}:</strong> {notification.recipient_name}
                                </span>
                              )}
                              <span>
                                <strong>{t("Notifications.table.date")}:</strong> {formatDateTime(notification.created_at)}
                              </span>
                            </div>
                            {/* عرض معلومات المحتوى إذا كان موجود */}
                            {notification.content_id && (
                              <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  <strong>{t("Notifications.content") || "المحتوى"}:</strong> {notification.content?.title || notification.content_id}
                                </p>
                              </div>
                            )}
                            {/* عرض معلومات الحالة إذا كانت موجودة */}
                            {notification.case_id && (
                              <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  <strong>{t("Notifications.case") || "الحالة"}:</strong> {notification.case?.title || notification.case_id}
                                </p>
                              </div>
                            )}
                            {notification.proposed_changes && (
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  <strong>{t("Notifications.proposedChanges") || "التغييرات المقترحة"}:</strong>{" "}
                                  {typeof notification.proposed_changes === 'object' 
                                    ? JSON.stringify(notification.proposed_changes, null, 2)
                                    : notification.proposed_changes}
                                </p>
                              </div>
                            )}
                            {notification.response_message && (
                              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  <strong>{t("Notifications.responseMessage") || "الرد"}:</strong>{" "}
                                  {notification.response_message}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleToggleRead(notification.id)}
                          className={`px-3 py-2 rounded-lg transition text-sm ${
                            notification.is_read
                              ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          }`}
                        >
                          {notification.is_read ? (t("Notifications.markAsUnread") || "تعليم كغير مقروء") : (t("Notifications.markAsRead") || "تعليم كمقروء")}
                        </button>
                        {notification.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAccept(notification)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition text-sm flex items-center gap-1"
                            >
                              <CheckCircle size={16} />
                              {t("Notifications.accept")}
                            </button>
                            <button
                              onClick={() => handleReject(notification)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition text-sm flex items-center gap-1"
                            >
                              <XCircle size={16} />
                              {t("Notifications.reject")}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setShowDetails(notification)}
                          className="px-3 py-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-900/50 transition text-sm flex items-center gap-1"
                        >
                          <Eye size={16} />
                          {t("Notifications.viewDetails")}
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition text-sm flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          {t("Notifications.delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Create Notification Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Notifications.createTitle")}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Notifications.form.notificationType")} *
                    </label>
                    <select
                      name="notification_type"
                      value={formData.notification_type}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">{t("Notifications.form.selectType")}</option>
                      <option value="appointment_update_request">{t("Notifications.types.appointment_update_request") || "طلب تحديث موعد"}</option>
                      <option value="appointment_cancel_request">{t("Notifications.types.appointment_cancel_request") || "طلب إلغاء موعد"}</option>
                      <option value="appointment_confirmed">{t("Notifications.types.appointment_confirmed") || "تأكيد موعد"}</option>
                      <option value="appointment_cancelled">{t("Notifications.types.appointment_cancelled") || "إلغاء موعد"}</option>
                      <option value="appointment_completed">{t("Notifications.types.appointment_completed") || "اكتمال موعد"}</option>
                      <option value="content_approval_request">{t("Notifications.types.content_approval_request") || "طلب موافقة على محتوى"}</option>
                      <option value="content_publish_request">{t("Notifications.types.content_publish_request") || "طلب نشر محتوى"}</option>
                      <option value="case_assignment_request">{t("Notifications.types.case_assignment_request") || "طلب إسناد حالة"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Notifications.form.appointment")}
                    </label>
                    <select
                      name="appointment_id"
                      value={formData.appointment_id}
                      onChange={handleChange}
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">{t("Notifications.form.selectAppointment")}</option>
                      {appointments.map((apt) => (
                        <option key={apt.id} value={apt.id}>
                          {apt.title || apt.id} - {formatDateTime(apt.appointment_date || apt.start_datetime)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Notifications.form.recipient")} *
                    </label>
                    <select
                      name="recipient_id"
                      value={formData.recipient_id}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">{t("Notifications.form.selectRecipient")}</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Notifications.form.title")} *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Notifications.form.message")} *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  {formData.notification_type === "appointment_update_request" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("Notifications.form.proposedChanges")} (JSON)
                      </label>
                      <textarea
                        name="proposed_changes"
                        value={formData.proposed_changes}
                        onChange={handleChange}
                        rows={3}
                        placeholder='{"appointment_date": "2024-01-01T10:00:00", "duration_minutes": 30}'
                        className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t("Notifications.form.proposedChangesHint") || "أدخل التغييرات بصيغة JSON (فقط لطلب تحديث الموعد)"}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                    >
                      {t("Notifications.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <Loader2 size={16} className="animate-spin" />}
                      {t("Notifications.save")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Details Modal */}
          {showDetails && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Notifications.viewDetails")}
                  </h2>
                  <button
                    onClick={() => setShowDetails(null)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">{t("Notifications.table.title")}:</strong>
                    <p className="text-slate-900 dark:text-white">{showDetails.title || "-"}</p>
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">{t("Notifications.table.message")}:</strong>
                    <p className="text-slate-900 dark:text-white">{showDetails.message || "-"}</p>
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">{t("Notifications.table.type")}:</strong>
                    <p className="text-slate-900 dark:text-white">{getTypeLabel(showDetails.notification_type)}</p>
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">{t("Notifications.table.status")}:</strong>
                    <div className="mt-1">{getStatusBadge(showDetails.status)}</div>
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">{t("Notifications.table.sender")}:</strong>
                    <p className="text-slate-900 dark:text-white">{showDetails.sender_name || "-"}</p>
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">{t("Notifications.table.recipient")}:</strong>
                    <p className="text-slate-900 dark:text-white">{showDetails.recipient_name || "-"}</p>
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">{t("Notifications.table.date")}:</strong>
                    <p className="text-slate-900 dark:text-white">{formatDateTime(showDetails.created_at)}</p>
                  </div>
                  {showDetails.proposed_changes && (
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">
                        {t("Notifications.proposedChanges")}:
                      </strong>
                      <pre className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 p-2 rounded mt-1 text-sm overflow-x-auto">
                        {typeof showDetails.proposed_changes === 'object' 
                          ? JSON.stringify(showDetails.proposed_changes, null, 2)
                          : showDetails.proposed_changes}
                      </pre>
                    </div>
                  )}
                  {showDetails.response_message && (
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">
                        {t("Notifications.responseMessage")}:
                      </strong>
                      <p className="text-slate-900 dark:text-white">{showDetails.response_message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Response Modal (Accept/Reject) */}
          {showResponseModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {showResponseModal.status === "pending"
                      ? t("Notifications.respondToNotification") || "الرد على الإشعار"
                      : t("Notifications.updateResponse") || "تحديث الرد"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowResponseModal(null);
                      setResponseMessage("");
                    }}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Notifications.responseMessage")} ({t("Notifications.optional") || "اختياري"})
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder={t("Notifications.responsePlaceholder") || "اكتب رسالة الرد..."}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowResponseModal(null);
                        setResponseMessage("");
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                    >
                      {t("Notifications.cancel")}
                    </button>
                    {showResponseModal.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleSubmitResponse("accepted")}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          {t("Notifications.accept")}
                        </button>
                        <button
                          onClick={() => handleSubmitResponse("rejected")}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          {t("Notifications.reject")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}
