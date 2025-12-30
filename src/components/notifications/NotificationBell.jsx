"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchNotificationsAsync,
  fetchUnreadCountAsync,
  toggleNotificationReadAsync,
  updateNotificationAsync,
} from "@/redux/features/notifications/notificationsSlice";
import { getUser } from "@/lib/auth";
import NotificationsList from "./NotificationsList";

/**
 * مكون جرس الإشعارات
 * يعرض عدد الإشعارات غير المقروءة وقائمة الإشعارات
 */
export default function NotificationBell() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  // Redux state
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  // جلب بيانات المستخدم
  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  // جلب الإشعارات عند التحميل
  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      try {
        await dispatch(fetchNotificationsAsync({ recipient_id: user.id })).unwrap();
        await dispatch(fetchUnreadCountAsync({ recipient_id: user.id })).unwrap();
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading notifications:", error);
        }
      }
    };

    loadNotifications();

    // إعادة جلب الإشعارات كل 30 ثانية
    const interval = setInterval(() => {
      dispatch(fetchUnreadCountAsync({ recipient_id: user.id }));
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, user?.id]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // عند فتح القائمة، نجلب الإشعارات مرة أخرى
    if (!isOpen && user?.id) {
      dispatch(fetchNotificationsAsync({ recipient_id: user.id }));
    }
  };

  const handleNotificationClick = async (notification) => {
    // تعليم الإشعار كمقروء
    if (!notification.is_read) {
      try {
        await dispatch(
          updateNotificationAsync({
            id: notification.id,
            is_read: true,
          })
        ).unwrap();
        // تحديث العدد غير المقروء
        if (user?.id) {
          dispatch(fetchUnreadCountAsync({ recipient_id: user.id }));
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error marking notification as read:", error);
        }
      }
    }

    // إذا كان الإشعار متعلق بموعد، ننتقل لصفحة المواعيد
    if (notification.appointment_id) {
      router.push(`/appointments?appointment=${notification.appointment_id}`);
      setIsOpen(false);
    }
    // إذا كان متعلق ببرنامج، ننتقل لصفحة البرامج
    else if (notification.target_type === "program" && notification.target_id) {
      router.push(`/academic-structure?program=${notification.target_id}`);
      setIsOpen(false);
    }
    // إذا كان متعلق بسنة أكاديمية، ننتقل لصفحة السنوات
    else if (notification.target_type === "academic_year" && notification.target_id) {
      router.push(`/academic-structure?year=${notification.target_id}`);
      setIsOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg bg-white dark:bg-dark-light border border-slate-200 dark:border-dark-lighter
          hover:bg-slate-50 dark:hover:bg-dark-lighter text-slate-700 dark:text-slate-300 
          focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 
          transition-colors"
        aria-label="الإشعارات"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -end-1 bg-red-500 text-white rounded-full 
              text-[10px] font-bold w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 end-0 w-96 max-h-[600px] 
              bg-white dark:bg-dark-light rounded-lg border border-slate-200 dark:border-dark-lighter z-50
              shadow-xl overflow-hidden flex flex-col"
          >
            <NotificationsList
              notifications={notifications}
              loading={loading}
              unreadCount={unreadCount}
              onNotificationClick={handleNotificationClick}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}





