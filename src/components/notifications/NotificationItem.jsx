"use client";

import { Check, XCircle, Info, Clock, Calendar, GraduationCap, School } from "lucide-react";

/**
 * مكون عنصر إشعار واحد
 */
export default function NotificationItem({ notification, onClick }) {
  if (!notification) return null;

  // تحديد الأيقونة حسب نوع الإشعار
  const getIcon = () => {
    switch (notification.notification_type) {
      case "appointment_request":
      case "appointment_accepted":
      case "appointment_rejected":
        return <Calendar size={18} className="text-sky-600 dark:text-sky-400" />;
      case "program_created":
      case "program_updated":
        return <GraduationCap size={18} className="text-green-600 dark:text-green-400" />;
      case "academic_year_created":
      case "academic_year_updated":
        return <School size={18} className="text-purple-600 dark:text-purple-400" />;
      default:
        return <Info size={18} className="text-slate-600 dark:text-slate-400" />;
    }
  };

  // تحديد لون الحالة
  const getStatusColor = () => {
    switch (notification.status) {
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return "الآن";
      if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
      if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
      if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
      
      // إذا كان أقدم من أسبوع، نعرض التاريخ
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const isUnread = !notification.is_read;

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors ${
        isUnread
          ? "bg-sky-50 dark:bg-sky-900/10 hover:bg-sky-100 dark:hover:bg-sky-900/20"
          : "hover:bg-slate-50 dark:hover:bg-dark-lighter"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4
                className={`text-sm font-medium mb-1 ${
                  isUnread
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {notification.title || "إشعار جديد"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                {notification.message || ""}
              </p>
            </div>

            {/* Unread indicator */}
            {isUnread && (
              <div className="flex-shrink-0 w-2 h-2 bg-sky-600 rounded-full mt-1"></div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-2">
            {/* Status badge */}
            {notification.status && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}
              >
                {notification.status === "accepted" && "مقبول"}
                {notification.status === "rejected" && "مرفوض"}
                {notification.status === "pending" && "قيد الانتظار"}
                {notification.status === "info" && "معلومات"}
              </span>
            )}

            {/* Date */}
            {notification.created_at && (
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {formatDate(notification.created_at)}
              </span>
            )}
          </div>

          {/* Response message */}
          {notification.response_message && (
            <div className="mt-2 p-2 bg-slate-100 dark:bg-dark-lighter rounded text-xs text-slate-600 dark:text-slate-400">
              {notification.response_message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

