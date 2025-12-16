"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ToggleTheme from "./ToggleTheme";
import { fetchNotificationsAsync, toggleNotificationReadAsync, fetchUnreadCountAsync } from "../redux/features/notifications/notificationsSlice";

// دالة إرسال إشعار
export function sendNotification(notification) {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  notifications.push(notification);
  localStorage.setItem("notifications", JSON.stringify(notifications));
  window.dispatchEvent(new Event("new-notification"));
}

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const menuRef = useRef(null);
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // إشعارات من Redux
  const notificationsState = useSelector((state) => state.notifications);
  const notifications = notificationsState?.notifications || [];
  const unreadCount = notificationsState?.unreadCount || 0;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);

    const handleUserLogin = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(updatedUser);
    };

    window.addEventListener("user-login", handleUserLogin);
    return () => window.removeEventListener("user-login", handleUserLogin);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // تحميل الإشعارات من API
  useEffect(() => {
    // جلب جميع الإشعارات (بدون فلترة recipient_id لأن المصادقة غير مفعلة)
    dispatch(fetchNotificationsAsync({}));
    dispatch(fetchUnreadCountAsync({}));
  }, [dispatch]);

  // إعادة جلب الإشعارات كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchNotificationsAsync({}));
      dispatch(fetchUnreadCountAsync({}));
    }, 30000); // 30 ثانية

    return () => clearInterval(interval);
  }, [dispatch]);

  const markAsRead = async (id) => {
    try {
      await dispatch(toggleNotificationReadAsync(id)).unwrap();
      // إعادة جلب الإشعارات بعد التحديث
      if (currentUser?.id) {
        dispatch(fetchNotificationsAsync({ recipient_id: currentUser.id }));
        dispatch(fetchUnreadCountAsync({ recipient_id: currentUser.id }));
      }
    } catch (error) {
      console.error("Error toggling notification read status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    router.push("/login");
  };

  if (!mounted) return null;

  const isRtl = i18n?.language === "ar";
  const fallbackInitial =
    currentUser?.name?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase();

  // --- Framer Variants ---
  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.1 } },
  };

  const menuItem = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.1 } },
  };

  return (
    <>
      {/* === Navbar Desktop === */}
      <motion.nav
        dir={isRtl ? "rtl" : "ltr"}
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="navbar-main hidden xl:flex w-full shadow-md px-4 sm:px-6 py-2 sm:py-3 items-center justify-between flex-wrap gap-2 sm:gap-4 -mt-4 sm:-mt-5
        bg-gradient-to-r from-sky-50 via-sky-200 to-blue-900 dark:bg-slate-900 backdrop-blur-sm border-b border-sky-200 dark:border-slate-700 transition-colors duration-200"
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0 min-w-[140px]"
          onClick={() => router.push("/")}
        >
          <div>
            <Image
              src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
              alt={t("Navbar.logoAlt")}
              width={45}
              height={45}
              className="rounded-full border shadow bg-white"
            />
          </div>
          <span className="font-extrabold text-lg sm:text-xl text-blue-900 dark:text-slate-50 tracking-wide">
            MediSmile
          </span>
        </div>

        {currentUser && (
          <motion.div
            variants={fadeIn}
            className="flex items-center gap-4 flex-wrap flex-shrink-0 min-w-[260px]"
          >
            {/* Search */}
            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              type="text"
              placeholder={t("Navbar.searchPlaceholder")}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-sky-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70
                         placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none 
                         focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[240px] text-sm sm:text-base
                         ${isRtl ? "text-right" : "text-left"} transition`}
            />

            {/* تبديل الوضع الليلي/النهاري */}
            <motion.div variants={menuItem}>
              <ToggleTheme />
            </motion.div>

            {/* إشعارات */}
            <motion.div variants={menuItem} className="relative">
              <motion.button
                onClick={() => router.push("/notifications")}
                className="relative p-2 rounded-full hover:bg-sky-200/50 dark:hover:bg-slate-800 text-blue-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            </motion.div>

            {/* Profile */}
            <motion.div
              ref={menuRef}
              whileHover={{ scale: 1.05 }}
              className="relative flex items-center"
            >
              <div
                className="h-10 w-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center
                           text-white font-bold cursor-pointer shadow overflow-hidden transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {currentUser.image ? (
                  <Image
                    src={currentUser.image}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  fallbackInitial
                )}
              </div>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className={`absolute top-12 ${isRtl ? "left-0" : "right-0"} w-48 
                               bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-sky-200 dark:border-slate-700 z-50
                               flex flex-col py-1`}
                  >
                    {currentUser.role === "supervisor" && (
                      <button
                        onClick={() => {
                          router.push("/ClinicalCases");
                          setMenuOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-sky-200 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-200 text-sm text-start"
                      >
                        لوحة المشرف
                      </button>
                    )}
                    {currentUser.role === "college_admin" && (
                      <button
                        onClick={() => {
                          router.push("/patients");
                          setMenuOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-sky-200 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-200 text-sm text-start"
                      >
                        لوحة إدارة الكلية
                      </button>
                    )}
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-sky-200 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-200 text-sm text-start"
                    >
                      {t("Navbar.profile")}
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-sky-200 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-200 text-sm text-start"
                    >
                      {t("Navbar.settings")}
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400 text-sm text-start"
                    >
                      {t("Navbar.logout")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </motion.nav>

      {/* === Navbar Mobile === */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="navbar-mobile xl:hidden w-full bg-gradient-to-r from-sky-50 via-sky-200 to-blue-900 dark:bg-slate-900 shadow px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center border-b border-sky-200 dark:border-slate-700 transition-colors duration-200 -mt-4 sm:-mt-5"
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
            alt={t("Navbar.logoAlt")}
            width={35}
            height={35}
            className="rounded-full border shadow bg-white"
          />
          <span className="font-bold text-base sm:text-lg text-blue-900 dark:text-slate-50">MediSmile</span>
        </div>

        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="p-2 rounded-md hover:bg-white/20 dark:hover:bg-slate-800 text-blue-900 dark:text-slate-50 transition"
        >
          {mobileMenu ? <X size={28} /> : <Menu size={28} />}
        </button>
      </motion.div>

      {/* === Drawer Mobile Menu === */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className={`navbar-drawer fixed top-0 ${isRtl ? "left-0" : "right-0"} h-full w-64 sm:w-72 bg-white dark:bg-slate-900 shadow-lg 
            transform z-50 border-l border-sky-200 dark:border-slate-700 overflow-y-auto`}
          >
            <div className="p-3 sm:p-4">
              <button
                className="mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-50 transition"
                onClick={() => setMobileMenu(false)}
              >
                <X size={20} /> {t("إغلاق") || "إغلاق"}
              </button>

              {currentUser && (
                <>
                  {/* Search */}
                  <input
                    type="text"
                    placeholder={t("Navbar.searchPlaceholder")}
                    className={`w-full mb-3 px-3 py-2 rounded-lg border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
                      isRtl ? "text-right" : "text-left"
                    } transition`}
                  />

                  {/* تبديل الوضع الليلي/النهاري */}
                  <div className="flex items-center gap-2 py-2 w-full px-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900 transition">
                    <ToggleTheme />
                    <span className="text-slate-700 dark:text-slate-200">تبديل المظهر</span>
                  </div>

                  {/* إشعارات */}
                  <button
                    onClick={() => {
                      router.push("/notifications");
                      setMobileMenu(false);
                    }}
                    className="flex items-center gap-2 py-2 w-full text-left hover:bg-sky-50 dark:hover:bg-slate-900 rounded transition text-slate-700 dark:text-slate-200 relative"
                  >
                    <Bell size={20} /> إشعارات {unreadCount > 0 && `(${unreadCount})`}
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* روابط حسب الدور */}
                  {currentUser.role === "supervisor" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      onClick={() => {
                        router.push("/ClinicalCases");
                        setMobileMenu(false);
                      }}
                      className="block w-full text-left py-2 hover:bg-sky-50 dark:hover:bg-slate-900 rounded transition text-slate-700 dark:text-slate-200"
                    >
                      لوحة المشرف
                    </motion.button>
                  )}
                  {currentUser.role === "college_admin" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      onClick={() => {
                        router.push("/patients");
                        setMobileMenu(false);
                      }}
                      className="block w-full text-left py-2 hover:bg-sky-50 dark:hover:bg-slate-900 rounded transition text-slate-700 dark:text-slate-200"
                    >
                      لوحة إدارة الكلية
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => {
                      router.push("/profile");
                      setMobileMenu(false);
                    }}
                    className="block w-full text-left py-2 hover:bg-sky-50 dark:hover:bg-slate-900 rounded transition text-slate-700 dark:text-slate-200"
                  >
                    {t("Navbar.profile")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => {
                      router.push("/settings");
                      setMobileMenu(false);
                    }}
                    className="block w-full text-left py-2 hover:bg-sky-50 dark:hover:bg-slate-900 rounded transition text-slate-700 dark:text-slate-200"
                  >
                    {t("Navbar.settings")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => {
                      handleLogout();
                      setMobileMenu(false);
                    }}
                    className="block w-full text-left py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                  >
                    {t("Navbar.logout")}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
