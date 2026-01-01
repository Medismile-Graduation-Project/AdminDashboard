"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Bell,
  Loader2,
  Eye,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  fetchNotificationsAsync,
  fetchNotificationByIdAsync,
  updateNotificationAsync,
  createNotificationAsync,
  clearError,
  setFilters,
  clearFilters,
} from "../../redux/features/notifications/notificationsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";
import RoleGuard from "@/components/RoleGuard";

export default function NotificationsPage() {
  return (
    <RoleGuard>
      <NotificationsContent />
    </RoleGuard>
  );
}

function NotificationsContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const notificationsState = useSelector((state) => state.notifications);
  const notifications = notificationsState?.notifications || [];
  const selectedNotification = notificationsState?.selectedNotification;
  const loading = notificationsState?.loading || false;
  const loadingSelected = notificationsState?.loadingSelected || false;
  const error = notificationsState?.error || null;
  const pagination = notificationsState?.pagination || { count: 0, next: null, previous: null };
  const filters = notificationsState?.filters || {};

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [showDetails, setShowDetails] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [formData, setFormData] = useState({
    notification_type: "system_alert",
    priority: "normal",
    title: "",
    message: "",
    recipient_id: "",
    target_type: "",
    target_id: "",
    appointment_id: "",
    proposed_changes: "",
  });

  const isRtl = i18n?.language === "ar";

  // جلب الإشعارات عند تحميل الصفحة
  useEffect(() => {
    const params = {
      page: currentPage,
      page_size: pageSize,
    };
    
    if (filters.is_read !== null) {
      params.is_read = filters.is_read;
    }
    if (filters.status) {
      params.status = filters.status;
    }
    
    dispatch(fetchNotificationsAsync(params));
    // استخدام القيم الفردية بدلاً من الكائن لتجنب الحلقة التكرارية
  }, [dispatch, currentPage, pageSize, filters.is_read, filters.status]);

  // عرض رسائل الخطأ
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // معالجة عرض التفاصيل
  const handleViewDetails = async (notificationId) => {
    try {
      await dispatch(fetchNotificationByIdAsync(notificationId)).unwrap();
      setShowDetails(notificationId);
    } catch (error) {
      toast.error(error || t("Notifications.fetchError") || "فشل في جلب تفاصيل الإشعار");
    }
  };

  // معالجة تحديث حالة القراءة
  const handleToggleRead = async (notificationId, isRead) => {
    try {
      await dispatch(updateNotificationAsync({
        id: notificationId,
        is_read: !isRead,
      })).unwrap();
      toast.success(t("Notifications.updateSuccess") || "تم تحديث الإشعار بنجاح");
      
      // إعادة جلب الإشعارات
      const params = {
        page: currentPage,
        page_size: pageSize,
      };
      if (filters.is_read !== null) params.is_read = filters.is_read;
      if (filters.status) params.status = filters.status;
      dispatch(fetchNotificationsAsync(params));
    } catch (error) {
      toast.error(error || t("Notifications.updateError") || "فشل في تحديث الإشعار");
    }
  };

  // معالجة إنشاء إشعار
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        notification_type: formData.notification_type,
        priority: formData.priority,
        title: formData.title,
        message: formData.message,
      };
      
      if (formData.recipient_id) {
        submitData.recipient_id = formData.recipient_id;
      }
      if (formData.target_type && formData.target_id) {
        submitData.target_type = formData.target_type;
        submitData.target_id = formData.target_id;
      }
      if (formData.appointment_id) {
        submitData.appointment_id = formData.appointment_id;
      }
      if (formData.proposed_changes) {
        try {
          submitData.proposed_changes = JSON.parse(formData.proposed_changes);
        } catch {
          // إذا لم يكن JSON صحيح، نرسله كـ string
          submitData.proposed_changes = formData.proposed_changes;
        }
      }
      
      await dispatch(createNotificationAsync(submitData)).unwrap();
      toast.success(t("Notifications.createSuccess") || "تم إنشاء الإشعار بنجاح");
      setShowForm(false);
      setFormData({
        notification_type: "system_alert",
        priority: "normal",
        title: "",
        message: "",
        recipient_id: "",
        target_type: "",
        target_id: "",
        appointment_id: "",
        proposed_changes: "",
      });
      
      // إعادة جلب الإشعارات
      const params = {
        page: currentPage,
        page_size: pageSize,
      };
      if (filters.is_read !== null) params.is_read = filters.is_read;
      if (filters.status) params.status = filters.status;
      dispatch(fetchNotificationsAsync(params));
    } catch (error) {
      toast.error(error || t("Notifications.createError") || "فشل في إنشاء الإشعار");
    }
  };

  // تنسيق التاريخ
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // دالة للحصول على لون الأولوية
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "high":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "normal":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "low":
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
    }
  };

  // دالة للحصول على أيقونة الأولوية
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle size={14} />;
      case "high":
        return <AlertCircle size={14} />;
      case "normal":
        return <Info size={14} />;
      case "low":
        return <Bell size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  // الأنواع المسموحة للإشعارات (للمسؤول الجامعة - إدارية/نظامية فقط)
  const adminNotificationTypes = [
    { value: "system_alert", label: "Notifications.types.system_alert" },
    { value: "backup_status", label: "Notifications.types.backup_status" },
    { value: "security_event", label: "Notifications.types.security_event" },
  ];

  // حساب عدد الصفحات
  const totalPages = Math.ceil(pagination.count / pageSize);

  if (!mounted) {
    return <div className="p-4 min-h-screen bg-sky-50 dark:bg-dark"></div>;
  }

  return (
    <AnimatedWrapper>
      <div
        className={`p-4 sm:p-6 lg:p-8 min-h-screen bg-sky-50 dark:bg-dark ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {t("Notifications.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  {t("Notifications.description")}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className={`flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <PlusCircle size={18} />
                <span>{t("Notifications.createNotification")}</span>
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-dark-light rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className={`flex flex-wrap gap-4 items-end ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("Notifications.table.read")}
                </label>
                <select
                  value={filters.is_read === null ? "all" : filters.is_read ? "read" : "unread"}
                  onChange={(e) => {
                    const value = e.target.value === "all" ? null : e.target.value === "read";
                    dispatch(setFilters({ is_read: value }));
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">{t("actions.all")}</option>
                  <option value="read">{t("Notifications.read")}</option>
                  <option value="unread">{t("Notifications.unread")}</option>
                </select>
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("Notifications.table.status")}
                </label>
                <select
                  value={filters.status || "all"}
                  onChange={(e) => {
                    const value = e.target.value === "all" ? null : e.target.value;
                    dispatch(setFilters({ status: value }));
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">{t("actions.all")}</option>
                  <option value="pending">{t("Notifications.pending")}</option>
                  <option value="accepted">{t("Notifications.accepted")}</option>
                  <option value="rejected">{t("Notifications.rejected")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && notifications.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={32} />
            </div>
          )}

          {/* Notifications List */}
          {!loading && (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="bg-white dark:bg-dark-light rounded-xl p-12 text-center border border-sky-200 dark:border-slate-700">
                  <Bell size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                  <p className="text-sky-600 dark:text-sky-400 text-lg">
                    {t("Notifications.noNotifications")}
                  </p>
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white dark:bg-dark-light rounded-xl p-5 border-2 transition ${
                        notification.is_read
                          ? "border-slate-200 dark:border-slate-700"
                          : "border-sky-500 dark:border-sky-400"
                      }`}
                    >
                      <div className={`flex flex-col sm:flex-row justify-between gap-4 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
                        <div className="flex-1">
                          <div className={`flex items-start gap-3 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 flex-shrink-0"></div>
                            )}
                            <div className="flex-1">
                              <div className={`flex items-center gap-2 mb-2 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                  {notification.title || "-"}
                                </h3>
                                {notification.priority && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${getPriorityColor(notification.priority)}`}>
                                    {getPriorityIcon(notification.priority)}
                                    {t(`Notifications.priority.${notification.priority}`) || notification.priority}
                                  </span>
                                )}
                                {notification.notification_type && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {t(`Notifications.types.${notification.notification_type}`) || notification.notification_type}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {notification.message || "-"}
                              </p>
                              <div className={`flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 ${isRtl ? "flex-row-reverse" : ""}`}>
                                <span>
                                  <strong>{t("Notifications.table.date")}:</strong> {formatDateTime(notification.created_at)}
                                </span>
                                {notification.sender_name && (
                                  <span>
                                    <strong>{t("Notifications.table.sender")}:</strong> {notification.sender_name}
                                  </span>
                                )}
                                {notification.target_type && notification.target_object_id && (
                                  <span className="flex items-center gap-1">
                                    <strong>{t(`Notifications.targetType.${notification.target_type}`) || notification.target_type}:</strong>
                                    <span className="text-sky-600 dark:text-sky-400">{notification.target_object_id.substring(0, 8)}...</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={`flex gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <button
                            onClick={() => handleViewDetails(notification.id)}
                            className={`px-4 py-2 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all duration-200 text-sm flex items-center gap-1.5 font-medium ${isRtl ? "flex-row-reverse" : ""}`}
                          >
                            <Eye size={16} />
                            {t("Notifications.viewDetails")}
                          </button>
                          <button
                            onClick={() => handleToggleRead(notification.id, notification.is_read)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-1.5 font-medium ${
                              notification.is_read
                                ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            } ${isRtl ? "flex-row-reverse" : ""}`}
                          >
                            <CheckCircle size={16} />
                            {notification.is_read ? t("Notifications.markAsUnread") : t("Notifications.markAsRead")}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={`flex justify-center items-center gap-2 mt-6 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={!pagination.previous || currentPage === 1}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-light text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5"
                      >
                        <ChevronLeft size={16} />
                        {t("actions.previous") || "السابق"}
                      </button>
                      <span className="px-4 py-2 text-slate-700 dark:text-slate-300">
                        {t("actions.page") || "صفحة"} {currentPage} {t("actions.of") || "من"} {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={!pagination.next || currentPage === totalPages}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-light text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5"
                      >
                        {t("actions.next") || "التالي"}
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Details Modal */}
          {showDetails && selectedNotification && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
              <div className="bg-white dark:bg-dark-light rounded-xl p-5 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className={`flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Notifications.viewDetails")}
                  </h2>
                  <button
                    onClick={() => setShowDetails(null)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} className="text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                {loadingSelected ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={32} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {t("Notifications.table.title")}
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedNotification.title || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {t("Notifications.table.message")}
                      </p>
                      <p className="text-slate-900 dark:text-white">{selectedNotification.message || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {t("Notifications.table.date")}
                      </p>
                      <p className="text-slate-900 dark:text-white">{formatDateTime(selectedNotification.created_at)}</p>
                    </div>
                    {selectedNotification.sender_name && (
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("Notifications.table.sender")}
                        </p>
                        <p className="text-slate-900 dark:text-white">{selectedNotification.sender_name}</p>
                      </div>
                    )}
                    {selectedNotification.notification_type && (
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("Notifications.table.type")}
                        </p>
                        <p className="text-slate-900 dark:text-white">
                          {t(`Notifications.types.${selectedNotification.notification_type}`) || selectedNotification.notification_type}
                        </p>
                      </div>
                    )}
                    {selectedNotification.priority && (
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("Notifications.priorityLabel")}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedNotification.priority)}`}>
                          {getPriorityIcon(selectedNotification.priority)}
                          {t(`Notifications.priority.${selectedNotification.priority}`) || selectedNotification.priority}
                        </span>
                      </div>
                    )}
                    {selectedNotification.target_type && selectedNotification.target_object_id && (
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("Notifications.targetObject")}
                        </p>
                        <p className="text-slate-900 dark:text-white">
                          <strong>{t(`Notifications.targetType.${selectedNotification.target_type}`) || selectedNotification.target_type}:</strong> {selectedNotification.target_object_id}
                        </p>
                      </div>
                    )}
                    {selectedNotification.appointment_id && (
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("Notifications.table.appointment")}
                        </p>
                        <p className="text-slate-900 dark:text-white">{selectedNotification.appointment_id}</p>
                      </div>
                    )}
                    {selectedNotification.proposed_changes && (
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("Notifications.form.proposedChanges")}
                        </p>
                        <pre className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs text-slate-900 dark:text-white overflow-x-auto border border-slate-200 dark:border-slate-700">
                          {typeof selectedNotification.proposed_changes === "object" 
                            ? JSON.stringify(selectedNotification.proposed_changes, null, 2)
                            : selectedNotification.proposed_changes}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Notification Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
              <div className="bg-white dark:bg-dark-light rounded-xl p-5 sm:p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className={`flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Notifications.createTitle")}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} className="text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      {t("Notifications.form.notificationType")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.notification_type}
                      onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                    >
                      {adminNotificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {t(type.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      {t("Notifications.priorityLabel")}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                    >
                      <option value="low">{t("Notifications.priority.low")}</option>
                      <option value="normal">{t("Notifications.priority.normal")}</option>
                      <option value="high">{t("Notifications.priority.high")}</option>
                      <option value="critical">{t("Notifications.priority.critical")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      {t("Notifications.form.title")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      {t("Notifications.form.message")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      {t("Notifications.form.targetType")}
                    </label>
                    <select
                      value={formData.target_type}
                      onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                    >
                      <option value="">{t("actions.all")} - {t("Notifications.form.selectTargetType")}</option>
                      <option value="report">{t("Notifications.targetType.report")}</option>
                      <option value="case">{t("Notifications.targetType.case")}</option>
                      <option value="appointment">{t("Notifications.targetType.appointment")}</option>
                      <option value="evaluation">{t("Notifications.targetType.evaluation")}</option>
                      <option value="message">{t("Notifications.targetType.message")}</option>
                    </select>
                  </div>
                  {formData.target_type && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        {t("Notifications.form.targetId")}
                      </label>
                      <input
                        type="text"
                        value={formData.target_id}
                        onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                        placeholder={t("Notifications.form.targetIdPlaceholder")}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      {t("Notifications.form.proposedChanges")}
                    </label>
                    <textarea
                      value={formData.proposed_changes}
                      onChange={(e) => setFormData({ ...formData, proposed_changes: e.target.value })}
                      placeholder={t("Notifications.form.proposedChangesPlaceholder")}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200 resize-none font-mono text-xs"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("Notifications.form.proposedChangesHint")}
                    </p>
                  </div>
                  <div className={`flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse justify-start" : "justify-end"}`}>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-semibold text-sm"
                    >
                      {t("actions.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
                    >
                      {t("actions.save")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}


