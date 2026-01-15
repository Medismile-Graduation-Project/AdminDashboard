"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function PageLoader({ loading, hasSidebar }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [isMobile, setIsMobile] = useState(false);

  // ✅ نتحقق من حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // أقل من 1024 يعتبر موبايل أو تابلت
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ نحسب موضع اللودر بالنسبة للـ Sidebar باستخدام فئات Tailwind فقط
  // على الشاشات الكبيرة: إذا كان هناك Sidebar لا نغطيه (نترك 18rem = 72)
  const sidebarOffsetClass =
    hasSidebar && !isMobile
      ? isRtl
        ? "lg:right-64" // RTL: السايدبار يمين → نترك مسافة من اليمين (16rem = w-64)
        : "lg:left-64" // LTR: السايدبار يسار → نترك مسافة من اليسار (16rem = w-64)
      : "";

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          dir={isRtl ? "rtl" : "ltr"}
          className={`fixed inset-y-0 left-0 right-0 flex flex-col items-center justify-center
                     z-[9999] bg-gradient-to-br 
                     from-blue-900/45 dark:from-slate-900/90 
                     via-blue-700/40 dark:via-slate-800/80 
                     to-indigo-900/45 dark:to-slate-900/90 
                     backdrop-blur-[6px] dark:backdrop-blur-[8px]
                     ${sidebarOffsetClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* أيقونة التحميل */}
          <motion.div
            className="flex items-center justify-center mb-4"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow-lg" />
          </motion.div>

          {/* نص التحميل */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.05,
              duration: 0.2,
            }}
            className="text-white text-2xl sm:text-3xl font-extrabold tracking-widest text-center drop-shadow-md"
          >
            {isRtl ? "جارٍ التحميل..." : "Loading..."}
          </motion.div>

          {/* نبض خفيف تحت النص */}
          <motion.div
            className="mt-4 w-8 h-8 rounded-full bg-white/30 dark:bg-white/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
