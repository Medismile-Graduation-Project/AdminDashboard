"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getUser } from "@/lib/auth";
import { menuItems } from "@/lib/roleConfig";

const Sidebar = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isRtl = i18n.language === "ar";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const noSidebarPages = ["/login"];
  if (noSidebarPages.includes(pathname)) return null;


  const renderMenu = () => {
    // تحديد اللغة للعرض
    const displayName = (item) => {
      if (isRtl) return item.name;
      return item.nameEn || item.name;
    };

    return (
      <ul className="flex flex-col gap-1.5">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const itemName = displayName(item);
          const itemKey = item.href || `menu-item-${index}`;

          return (
            <li key={itemKey}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-semibold text-start
                  ${
                    isActive
                      ? "bg-sky-600 text-white dark:bg-sky-600 shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-300"
                  }`}
                onClick={() => isMobile && setIsDropdownOpen(false)}
              >
                {Icon && (
                  <div className={`flex-shrink-0 ${isActive ? "text-white" : "text-sky-600 dark:text-sky-400"}`}>
                    <Icon size={20} />
                  </div>
                )}
                <span className="flex-1">{itemName}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="sidebar-main fixed top-0 start-0 h-screen w-64 z-50 p-5 flex flex-col bg-white dark:bg-dark border-e border-slate-200 dark:border-slate-700 overflow-y-auto"
        >
          <div className={`flex justify-between items-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("Root.title") || "MediSmile"}
            </h1>
            <div className={`flex gap-1.5 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <button
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                  i18n.language === "ar"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                onClick={() => i18n.changeLanguage("ar")}
                aria-label="Switch to Arabic"
              >
                AR
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                  i18n.language === "en"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                onClick={() => i18n.changeLanguage("en")}
                aria-label="Switch to English"
              >
                EN
              </button>
            </div>
          </div>

          <nav className="flex-1">
            {renderMenu()}
          </nav>
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
            className="sidebar-mobile-menu fixed top-28 start-0 w-full h-[calc(100vh-7rem)] overflow-y-auto bg-white dark:bg-dark border-t border-slate-200 dark:border-slate-700 z-40 p-5"
          >
            <nav>
              {renderMenu()}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      {isMobile && (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="sidebar-mobile-header fixed top-14 start-0 w-full z-[55] flex items-center justify-between px-4 py-3.5 bg-white dark:bg-dark border-b border-slate-200 dark:border-slate-700"
        >
          <button
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Toggle menu"
          >
            {isDropdownOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t("Root.title") || "MediSmile"}</h1>

          <div className={`flex gap-1.5 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            <button
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                i18n.language === "ar"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              onClick={() => i18n.changeLanguage("ar")}
              aria-label="Switch to Arabic"
            >
              AR
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                i18n.language === "en"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              onClick={() => i18n.changeLanguage("en")}
              aria-label="Switch to English"
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
