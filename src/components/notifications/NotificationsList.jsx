"use client";

import { useDispatch } from "react-redux";
import { X, Bell } from "lucide-react";
import { motion } from "framer-motion";
import {
  markAllNotificationsAsReadAsync,
  fetchUnreadCountAsync,
} from "@/redux/features/notifications/notificationsSlice";
import { getUser } from "@/lib/auth";
import NotificationItem from "./NotificationItem";

/**
 * مكون قائمة الإشعارات
 */
export default function NotificationsList({
  notifications = [],
  loading = false,
  unreadCount = 0,
  onNotificationClick,
  onClose,
}) {
  const dispatch = useDispatch();

  const handleMarkAllAsRead = async () => {
    const user = getUser();
    if (!user?.id) return;

    try {
      await dispatch(markAllNotificationsAsReadAsync({ recipient_id: user.id })).unwrap();
      await dispatch(fetchUnreadCountAsync({ recipient_id: user.id })).unwrap();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error marking all as read:", error);
      }
    }
  };

  // فلترة الإشعارات غير المقروءة أولاً
  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-dark-lighter">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            الإشعارات
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 
                font-medium transition-colors"
            >
              تعليم الكل كمقروء
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-lighter 
              text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-sm">جاري التحميل...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-dark-lighter">
            {/* غير المقروءة */}
            {unreadNotifications.length > 0 && (
              <div>
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => onNotificationClick?.(notification)}
                  />
                ))}
              </div>
            )}

            {/* المقروءة */}
            {readNotifications.length > 0 && (
              <div>
                {readNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => onNotificationClick?.(notification)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

