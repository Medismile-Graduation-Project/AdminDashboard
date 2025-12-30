"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ToggleTheme from "./ToggleTheme";
// 🔕 الإشعارات معلقة مؤقتاً
// import NotificationBell from "./notifications/NotificationBell";
import { logoutAsync } from "../redux/features/auth/authSlice";
import { getUser } from "@/lib/auth";
import toast from "react-hot-toast";

// دالة إرسال إشعار
export function sendNotification(notification) {
  try {
    const stored = localStorage.getItem("notifications");
    const notifications = stored ? JSON.parse(stored) : [];
    notifications.push(notification);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    window.dispatchEvent(new Event("new-notification"));
  } catch (error) {
    console.error("Error saving notification to localStorage:", error);
  }
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


  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // استخدام getUser من auth.js الذي يتعامل مع الأخطاء بشكل آمن
    const user = getUser();
    setCurrentUser(user);

    const handleUserLogin = () => {
      const updatedUser = getUser();
      setCurrentUser(updatedUser);
    };

    const handleUserLogout = () => {
      setCurrentUser(null);
    };

    window.addEventListener("user-login", handleUserLogin);
    window.addEventListener("user-logout", handleUserLogout);
    return () => {
      window.removeEventListener("user-login", handleUserLogin);
      window.removeEventListener("user-logout", handleUserLogout);
    };
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

  // ============================================
  // 🔕 الإشعارات معلقة مؤقتاً
  // ============================================
  // تحميل الإشعارات من API
  // useEffect(() => {
  //   // فقط إذا كان هناك مستخدم مسجل دخول
  //   if (!currentUser?.id) return;

  //   // جلب الإشعارات مرة واحدة عند التحميل
  //   const loadNotifications = async () => {
  //     try {
  //       await dispatch(fetchNotificationsAsync({ recipient_id: currentUser.id })).unwrap();
  //       await dispatch(fetchUnreadCountAsync({ recipient_id: currentUser.id })).unwrap();
  //     } catch (error) {
  //       // تجاهل الأخطاء الصامتة - لا نطبع في console لتجنب الفوضى
  //       // إذا كان الخطأ 500، سنتوقف عن إعادة المحاولة
  //     }
  //   };

  //   loadNotifications();
  // }, [dispatch, currentUser?.id]);

  // إعادة جلب الإشعارات كل 30 ثانية (فقط إذا نجحت المحاولة الأولى)
  // useEffect(() => {
  //   if (!currentUser?.id) return;

  //   let consecutiveErrors = 0;
  //   const MAX_CONSECUTIVE_ERRORS = 3; // بعد 3 أخطاء متتالية، نتوقف

  //   const interval = setInterval(async () => {
  //     try {
  //       await dispatch(fetchNotificationsAsync({ recipient_id: currentUser.id })).unwrap();
  //       await dispatch(fetchUnreadCountAsync({ recipient_id: currentUser.id })).unwrap();
  //       consecutiveErrors = 0; // نجحت، نعيد العداد
  //     } catch (error) {
  //       consecutiveErrors++;
        
  //       // إذا تجاوزنا الحد الأقصى للأخطاء، نتوقف عن إعادة المحاولة
  //       if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
  //         clearInterval(interval);
  //         // يمكن إضافة toast notification هنا لإعلام المستخدم
  //         return;
  //       }
  //     }
  //   }, 30000); // 30 ثانية

  //   return () => clearInterval(interval);
  // }, [dispatch, currentUser?.id]);

  // 🔕 الإشعارات معلقة مؤقتاً
  // const markAsRead = async (id) => {
  //   if (!id || !currentUser?.id) return;
    
  //   try {
  //     await dispatch(toggleNotificationReadAsync(id)).unwrap();
  //     // إعادة جلب الإشعارات بعد التحديث
  //     dispatch(fetchNotificationsAsync({ recipient_id: currentUser.id }));
  //     dispatch(fetchUnreadCountAsync({ recipient_id: currentUser.id }));
  //   } catch (error) {
  //     // لا نعرض الأخطاء في Console لتجنب الفوضى
  //     // console.error("Error toggling notification read status:", error);
  //   }
  // };

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
    currentUser?.first_name?.[0]?.toUpperCase() ||
    currentUser?.name?.[0]?.toUpperCase() ||
    currentUser?.username?.[0]?.toUpperCase() ||
    currentUser?.email?.[0]?.toUpperCase() ||
    "U";


  return (
    <>
      {/* === Navbar Desktop === */}
      <nav
        dir={isRtl ? "rtl" : "ltr"}
        className="navbar-main hidden lg:flex fixed top-0 start-0 end-0 lg:start-64 px-6 py-4 items-center justify-between gap-6
        bg-white dark:bg-dark border-b border-slate-200 dark:border-dark-lighter z-[60]"
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 cursor-pointer flex-shrink-0 transition-opacity hover:opacity-80 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
          onClick={() => router.push("/")}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-sky-100 dark:border-slate-700">
            <Image
              src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
              alt={t("Navbar.logoAlt") || "MediSmile Logo"}
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">
            MediSmile
          </span>
        </div>

        {currentUser && (
          <div className={`flex items-center gap-3 flex-shrink-0 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t("Navbar.searchPlaceholder") || "بحث..."}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600
                     bg-white dark:bg-dark-light
                     placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none 
                     focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 
                     w-[240px] text-sm transition-all duration-200 text-start"
              />
            </div>

            {/* تبديل الوضع الليلي/النهاري */}
            <div className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ToggleTheme />
            </div>

            {/* Profile */}
            <div
              ref={menuRef}
              className="relative flex items-center"
            >
              <button
                className="h-10 w-10 rounded-full bg-sky-600 dark:bg-sky-700 
                         flex items-center justify-center text-white font-semibold cursor-pointer 
                         overflow-hidden transition-all duration-200 hover:bg-sky-700 dark:hover:bg-sky-600
                         hover:ring-2 hover:ring-sky-500/30 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Profile menu"
              >
                {currentUser?.image ? (
                  <Image
                    src={currentUser.image}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // في حالة فشل تحميل الصورة، نخفي الصورة ونعرض الحرف
                      const button = e.target.closest("button");
                      const image = button?.querySelector("img");
                      const span = button?.querySelector("span");
                      if (image) image.style.display = "none";
                      if (span) span.style.display = "flex";
                    }}
                  />
                ) : null}
                <span className={`text-sm ${currentUser?.image ? "hidden" : "flex"}`}>
                  {fallbackInitial}
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-12 end-0 w-56 
                               bg-white dark:bg-dark-light rounded-lg border border-slate-200 dark:border-slate-700 z-50
                               flex flex-col py-1.5 overflow-hidden shadow-lg"
                  >
                    {/* هذا المشروع خاص فقط بإدارة الجامعة */}
                    {(currentUser.role === "university_admin" || currentUser.role === "college_admin") && (
                      <button
                        onClick={() => {
                          router.push("/");
                          setMenuOpen(false);
                        }}
                        className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 
                                 transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium text-start"
                      >
                        لوحة إدارة الجامعة
                      </button>
                    )}
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 
                               transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium text-start"
                    >
                      {t("Navbar.profile") || "الملف الشخصي"}
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 
                               transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium text-start"
                    >
                      {t("Navbar.settings") || "الإعدادات"}
                    </button>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-1.5"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className={`px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 
                               transition-colors text-red-600 dark:text-red-400 text-sm font-medium
                               ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {t("Navbar.logout") || "تسجيل الخروج"}
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
        className="navbar-mobile lg:hidden fixed top-0 start-0 w-full bg-white dark:bg-dark px-4 py-3.5 flex justify-between items-center border-b border-slate-200 dark:border-dark-lighter z-[60]"
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-2.5 cursor-pointer transition-opacity hover:opacity-80 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
          onClick={() => router.push("/")}
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-sky-100 dark:border-slate-700">
            <Image
              src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
              alt={t("Navbar.logoAlt") || "MediSmile Logo"}
              width={36}
              height={36}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white">
            MediSmile
          </span>
        </div>

        {/* Right side: notifications + menu */}
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
          {/* 🔕 إشعارات - معلقة مؤقتاً */}
          {/* {currentUser && <NotificationBell />} */}

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="p-2 rounded-lg bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-600
              hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* === Drawer Mobile Menu === */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            dir={isRtl ? "rtl" : "ltr"}
            className="navbar-drawer fixed top-0 end-0 h-full w-80 bg-white dark:bg-dark z-50 border-s border-slate-200 dark:border-slate-700 overflow-y-auto shadow-xl"
          >
            <div className="p-6">
              <div className={`flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">القائمة</h2>
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {currentUser && (
                <>
                  {/* Search */}
                  <input
                    type="text"
                    placeholder={t("Navbar.searchPlaceholder") || "بحث..."}
                    className="w-full mb-5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-dark-light 
                      text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none 
                      focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 text-start transition-all duration-200"
                  />

                  {/* تبديل الوضع الليلي/النهاري */}
                  <div className={`flex items-center gap-3 py-2.5 mb-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                    <ToggleTheme />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">تبديل المظهر</span>
                  </div>

                  {/* 🔕 إشعارات - معلقة مؤقتاً */}
                  {/* <button
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
                  </button> */}

                  <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>
                  
                  {/* هذا المشروع خاص فقط بإدارة الجامعة */}
                  {(currentUser.role === "university_admin" || currentUser.role === "college_admin") && (
                    <button
                      onClick={() => {
                        router.push("/");
                        setMobileMenu(false);
                      }}
                      className={`block w-full py-2.5 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium mb-1.5 ${isRtl ? "text-right" : "text-left"}`}
                    >
                      لوحة إدارة الجامعة
                    </button>
                  )}
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setMobileMenu(false);
                    }}
                    className={`block w-full py-2.5 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium mb-1.5 ${isRtl ? "text-right" : "text-left"}`}
                  >
                    {t("Navbar.profile") || "الملف الشخصي"}
                  </button>
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setMobileMenu(false);
                    }}
                    className={`block w-full py-2.5 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium mb-1.5 ${isRtl ? "text-right" : "text-left"}`}
                  >
                    {t("Navbar.settings") || "الإعدادات"}
                  </button>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenu(false);
                    }}
                    className={`block w-full py-2.5 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 font-medium ${isRtl ? "text-right" : "text-left"}`}
                  >
                    {t("Navbar.logout") || "تسجيل الخروج"}
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
