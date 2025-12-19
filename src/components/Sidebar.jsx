"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import {
  Menu,
  X,
  Home,
  FileText,
  Users,
  Calendar,
  BarChart2,
  BookOpen,
  Star,
  File,
  HelpCircle,
  Bell,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const Sidebar = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isRtl = i18n.language === "ar";
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const noSidebarPages = ["/login", "/register"];
  if (noSidebarPages.includes(pathname)) return null;

  let menuItems = [{ name: t("Sidebar.home"), href: "/", icon: <Home size={18} /> }];

  if (user?.role === "supervisor") {
    menuItems.push(
      { name: t("Sidebar.clinicalCases"), href: "/ClinicalCases", icon: <FileText size={18} /> },
      { name: t("Sidebar.sessions"), href: "/sessions", icon: <Calendar size={18} /> },
      { name: t("Sidebar.appointments"), href: "/appointments", icon: <Calendar size={18} /> },
      { name: t("Sidebar.instructions"), href: "/supervisor", icon: <BookOpen size={18} /> },
      { name: t("Sidebar.evaluations"), href: "/evaluations", icon: <Star size={18} /> },
      { name: t("Sidebar.studentsmanag"), href: "/studentsmanag", icon: <Users size={18} /> },
      { name: t("Sidebar.notifications"), href: "/notifications", icon: <Bell size={18} /> },
      { name: t("Sidebar.support"), href: "/support", icon: <HelpCircle size={18} /> }
    );
  }

  if (user?.role === "college_admin") {
    menuItems.push(
      { name: t("Sidebar.patients"), href: "/patients", icon: <Users size={18} /> },
      { name: t("Sidebar.appointments"), href: "/appointments", icon: <Calendar size={18} /> },
      { name: t("Sidebar.treatments"), href: "/treatments", icon: <BookOpen size={18} /> },
      { name: t("Sidebar.reports"), href: "/reports", icon: <BarChart2 size={18} /> },
      { name: t("Sidebar.content"), href: "/Medicontent", icon: <File size={18} /> },
      { name: t("Sidebar.studentsmanag"), href: "/studentsmanag", icon: <Users size={18} /> },
      { name: t("Sidebar.notifications"), href: "/notifications", icon: <Bell size={18} /> },
      { name: t("Sidebar.support"), href: "/support", icon: <HelpCircle size={18} /> }
    );
  }

  // إضافة الدعم لجميع الأدوار الأخرى أيضاً
  if (user && !menuItems.find((item) => item.href === "/support")) {
    menuItems.push(
      { name: t("Sidebar.support"), href: "/support", icon: <HelpCircle size={18} /> }
    );
  }


  const renderMenu = () => (
    <ul className="flex flex-col gap-2">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center gap-4 p-4 rounded-lg transition-colors text-base font-medium text-start
                ${
                  isActive
                    ? "bg-sky-600 text-white dark:bg-sky-600"
                    : "text-slate-700 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-dark-light hover:text-sky-700 dark:hover:text-sky-50"
                }`}
              onClick={() => isMobile && setIsDropdownOpen(false)}
            >
              <div className={`flex-shrink-0 ${isActive ? "text-white" : "text-sky-600 dark:text-sky-400"}`}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="sidebar-main fixed top-0 start-0 h-screen w-64 z-50 p-6 flex flex-col bg-white dark:bg-dark border-e border-slate-200 dark:border-dark-lighter overflow-y-auto"
        >
          <div className={`flex justify-between items-center mb-6 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("Root.title")}
            </h1>
            <div className={`flex gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <button
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                  i18n.language === "ar"
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 dark:bg-dark-light text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-lighter"
                }`}
                onClick={() => i18n.changeLanguage("ar")}
              >
                AR
              </button>
              <button
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                  i18n.language === "en"
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 dark:bg-dark-light text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-lighter"
                }`}
                onClick={() => i18n.changeLanguage("en")}
              >
                EN
              </button>
            </div>
          </div>

          {renderMenu()}
        </div>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && isDropdownOpen && (
          <motion.div
            key="mobileMenu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            dir={isRtl ? "rtl" : "ltr"}
            className="sidebar-mobile-menu fixed top-12 start-0 w-full h-[calc(100vh-3rem)] overflow-y-auto bg-white dark:bg-dark border-t border-slate-200 dark:border-dark-lighter z-40 p-4"
          >
            {renderMenu()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      {isMobile && (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="sidebar-mobile-header fixed top-0 start-0 w-full z-50 flex items-center justify-between px-4 py-3 bg-white dark:bg-dark border-b border-slate-200 dark:border-dark-lighter"
        >
          <button
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-light text-slate-700 dark:text-slate-300 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {isDropdownOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t("Root.title")}</h1>

          <div className={`flex gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            <button
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                i18n.language === "ar"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 dark:bg-dark-light text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-lighter"
              }`}
              onClick={() => i18n.changeLanguage("ar")}
            >
              AR
            </button>
            <button
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                i18n.language === "en"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 dark:bg-dark-light text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-lighter"
              }`}
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
