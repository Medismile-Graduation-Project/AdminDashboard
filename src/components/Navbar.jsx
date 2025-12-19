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
import { logoutAsync } from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";

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

  const handleLogout = async () => {
    try {
      // محاولة تسجيل الخروج (حتى لو فشل API، سيتم التنظيف المحلي في logoutAsync)
      const result = await dispatch(logoutAsync());
      
      // سواء نجح أو فشل API، التنظيف المحلي تم بالفعل
      setCurrentUser(null);
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/login");
    } catch (error) {
      // كإجراء احتياطي إضافي - تنظيف محلي
      console.warn("Logout error (performing local cleanup):", error);
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setCurrentUser(null);
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/login");
    }
  };

  if (!mounted) return null;

  const isRtl = i18n?.language === "ar";
  const fallbackInitial =
    currentUser?.name?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase();


  return (
    <>
      {/* === Navbar Desktop === */}
      <nav
        dir={isRtl ? "rtl" : "ltr"}
        className="navbar-main hidden lg:flex fixed top-0 start-0 end-0 lg:start-64 px-6 py-4 items-center justify-between gap-4
        bg-white dark:bg-dark border-b border-slate-200 dark:border-dark-lighter z-[60]"
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 cursor-pointer flex-shrink-0 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
          onClick={() => router.push("/")}
        >
          <div className="relative rounded-full">
              <Image
                src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
                alt={t("Navbar.logoAlt")}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <span className="font-semibold text-base text-slate-900 dark:text-white">
            MediSmile
          </span>
        </div>

        {currentUser && (
          <div className={`flex items-center gap-4 flex-shrink-0 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t("Navbar.searchPlaceholder")}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-lighter
                     bg-white dark:bg-dark-light
                     placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none 
                     focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 
                     w-[220px] text-sm transition-colors text-start"
              />
            </div>

            {/* تبديل الوضع الليلي/النهاري */}
            <div className="p-1.5 rounded-lg">
                <ToggleTheme />
              </div>

            {/* إشعارات */}
            <div className="relative">
              <button
                onClick={() => router.push("/notifications")}
                className="relative p-2 rounded-lg bg-white dark:bg-dark-light border border-slate-200 dark:border-dark-lighter
                  hover:bg-slate-50 dark:hover:bg-dark-lighter text-slate-700 dark:text-slate-300 
                  focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 
                  transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 bg-red-500 text-white rounded-full 
                    text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile */}
            <div
              ref={menuRef}
              className="relative flex items-center"
            >
              <button
                className="h-10 w-10 rounded-full bg-sky-600 dark:bg-sky-700 
                         flex items-center justify-center text-white font-semibold cursor-pointer 
                         overflow-hidden transition-colors hover:bg-sky-700 dark:hover:bg-sky-600"
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
                  <span className="text-sm">{fallbackInitial}</span>
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-12 end-0 w-56 
                               bg-white dark:bg-dark-light rounded-lg border border-slate-200 dark:border-dark-lighter z-50
                               flex flex-col py-2 overflow-hidden"
                  >
                    {currentUser.role === "supervisor" && (
                      <button
                        onClick={() => {
                          router.push("/ClinicalCases");
                          setMenuOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-dark-lighter 
                                 transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium text-start"
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
                        className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-dark-lighter 
                                 transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium text-start"
                      >
                        لوحة إدارة الكلية
                      </button>
                    )}
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-dark-lighter 
                               transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium text-start"
                    >
                      {t("Navbar.profile")}
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-dark-lighter 
                               transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium text-start"
                    >
                      {t("Navbar.settings")}
                    </button>
                    <div className="border-t border-slate-200 dark:border-dark-lighter my-2"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className={`px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 
                               transition-colors text-red-600 dark:text-red-400 text-sm font-medium
                               ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {t("Navbar.logout")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </nav>

      {/* === Navbar Mobile === */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="navbar-mobile lg:hidden fixed top-0 start-0 w-full bg-white dark:bg-dark px-4 py-3 flex justify-between items-center border-b border-slate-200 dark:border-dark-lighter z-[60]"
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-2 cursor-pointer ${isRtl ? "flex-row-reverse" : "flex-row"}`}
          onClick={() => router.push("/")}
        >
          <div className="relative rounded-full">
            <Image
              src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
              alt={t("Navbar.logoAlt")}
              width={28}
              height={28}
              className="rounded-full"
            />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-white">
            MediSmile
          </span>
        </div>

        {/* Right side: notifications + menu */}
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
          {currentUser && (
            <button
              onClick={() => router.push("/notifications")}
              className="relative p-2 rounded-lg bg-white dark:bg-dark-light border border-slate-200 dark:border-dark-lighter
                hover:bg-slate-50 dark:hover:bg-dark-lighter text-slate-700 dark:text-slate-300 
                transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full 
                  text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="p-2 rounded-lg bg-white dark:bg-dark-light border border-slate-200 dark:border-dark-lighter
              hover:bg-slate-50 dark:hover:bg-dark-lighter text-slate-700 dark:text-slate-300 
              transition-colors"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* === Drawer Mobile Menu === */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            dir={isRtl ? "rtl" : "ltr"}
            className="navbar-drawer fixed top-0 end-0 h-full w-80 bg-white dark:bg-dark z-50 border-s border-slate-200 dark:border-dark-lighter overflow-y-auto"
          >
            <div className="p-6">
              <div className={`flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-dark-lighter ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">القائمة</h2>
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-lighter text-slate-700 dark:text-slate-300 transition-colors"
                  onClick={() => setMobileMenu(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {currentUser && (
                <>
                  {/* Search */}
                  <input
                    type="text"
                    placeholder={t("Navbar.searchPlaceholder")}
                    className="w-full mb-4 px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-lighter bg-white dark:bg-dark-light 
                      text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none 
                      focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 text-start transition-colors"
                  />

                  {/* تبديل الوضع الليلي/النهاري */}
                  <div className={`flex items-center gap-3 py-2 mb-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-lighter transition-colors ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                    <ToggleTheme />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">تبديل المظهر</span>
                  </div>

                  {/* إشعارات */}
                  <button
                    onClick={() => {
                      router.push("/notifications");
                      setMobileMenu(false);
                    }}
                    className="flex items-center gap-3 py-2 w-full rounded-lg hover:bg-slate-100 dark:hover:bg-dark-lighter transition-colors text-slate-700 dark:text-slate-300 relative mb-2 font-medium text-start"
                  >
                    <Bell size={20} />
                    <span className="flex-1">إشعارات</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="border-t border-slate-200 dark:border-dark-lighter my-2"></div>
                  
                  {/* روابط حسب الدور */}
                  {currentUser.role === "supervisor" && (
                    <button
                      onClick={() => {
                        router.push("/ClinicalCases");
                        setMobileMenu(false);
                      }}
                      className="block w-full py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-lighter transition-colors text-slate-700 dark:text-slate-300 font-medium mb-1 text-start"
                    >
                      لوحة المشرف
                    </button>
                  )}
                  {currentUser.role === "college_admin" && (
                    <button
                      onClick={() => {
                        router.push("/patients");
                        setMobileMenu(false);
                      }}
                      className="block w-full py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-lighter transition-colors text-slate-700 dark:text-slate-300 font-medium mb-1 text-start"
                    >
                      لوحة إدارة الكلية
                    </button>
                  )}
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setMobileMenu(false);
                    }}
                    className={`block w-full py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-lighter transition-colors text-slate-700 dark:text-slate-300 font-medium mb-1 ${isRtl ? "text-right" : "text-left"}`}
                  >
                    {t("Navbar.profile")}
                  </button>
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setMobileMenu(false);
                    }}
                    className={`block w-full py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-lighter transition-colors text-slate-700 dark:text-slate-300 font-medium mb-1 ${isRtl ? "text-right" : "text-left"}`}
                  >
                    {t("Navbar.settings")}
                  </button>
                  
                  <div className="border-t border-slate-200 dark:border-dark-lighter my-2"></div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenu(false);
                    }}
                    className="block w-full py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 font-medium text-start"
                  >
                    {t("Navbar.logout")}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
