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
import { motion, AnimatePresence } from "framer-motion";

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

    const handleResize = () => setIsMobile(window.innerWidth < 1024);
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

  const itemVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.1 } },
  };

  const sidebarVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.1 } },
  };

  const renderMenu = () => (
    <motion.ul
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.01 } } }}
      className="flex flex-col gap-2"
    >
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <motion.li key={item.name} variants={itemVariants}>
            <Link
              href={item.href}
              className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg transition-all duration-200 text-sm sm:text-base
                ${
                  isActive
                    ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white shadow-md"
                    : "text-slate-900 dark:text-slate-300 hover:bg-sky-200 dark:hover:bg-slate-800 hover:text-blue-900 dark:hover:text-slate-50"
                }
                ${isRtl ? "flex-row-reverse text-right" : "flex-row text-left"}`}
              onClick={() => isMobile && setIsDropdownOpen(false)}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );

  return (
    <>
      {/* Desktop Sidebar with Animation */}
      {!isMobile && (
        <motion.div
          variants={sidebarVariants}
          initial="hidden"
          animate="show"
          className="sidebar-main fixed top-0 h-screen w-64 z-50 p-3 sm:p-4 flex flex-col shadow-lg bg-gradient-to-b from-sky-50 via-sky-200 to-blue-900 dark:bg-slate-900 border-r border-sky-300 dark:border-slate-700 overflow-y-auto transition-colors duration-200"
        >
          <div className="flex justify-between items-center mb-6">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold truncate text-blue-900 dark:text-slate-50"
            >
              {t("Root.title")}
            </motion.h1>
            <div className="flex gap-1">
              <button
                className="px-2 py-1 rounded bg-sky-200 hover:bg-blue-500 text-blue-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border dark:border-slate-700 transition"
                onClick={() => i18n.changeLanguage("ar")}
              >
                AR
              </button>
              <button
                className="px-2 py-1 rounded bg-sky-200 hover:bg-blue-500 text-blue-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border dark:border-slate-700 transition"
                onClick={() => i18n.changeLanguage("en")}
              >
                EN
              </button>
            </div>
          </div>

          {renderMenu()}
        </motion.div>
      )}

      {/* Mobile Menu Animation */}
      <AnimatePresence>
        {isMobile && isDropdownOpen && (
          <motion.div
            key="mobileMenu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="sidebar-mobile-menu fixed top-12 left-0 w-full h-[calc(100vh-3rem)] overflow-y-auto bg-sky-50 dark:bg-slate-900 dark:text-slate-100 shadow-xl z-40 p-3 sm:p-4 border-t border-sky-200 dark:border-slate-700 transition-colors duration-200"
          >
            {renderMenu()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      {isMobile && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="sidebar-mobile-header fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-2 shadow-md bg-gradient-to-r from-sky-50 via-sky-200 to-blue-900 dark:bg-slate-900 transition-colors duration-200"
        >
          <button
            className="p-2 rounded-md hover:bg-white/20 dark:hover:bg-slate-800 text-blue-900 dark:text-slate-50 transition"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {isDropdownOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <h1 className="text-lg font-bold text-blue-900 dark:text-slate-50">{t("Root.title")}</h1>

          <div className="flex gap-1">
            <button
              className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border dark:border-slate-700 text-blue-900 transition"
              onClick={() => i18n.changeLanguage("ar")}
            >
              AR
            </button>
            <button
              className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border dark:border-slate-700 text-blue-900 transition"
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Sidebar;
