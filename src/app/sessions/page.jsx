"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Search, Bell, Play } from "lucide-react";
import { motion } from "framer-motion";
import { deleteSession } from "../../redux/features/sessions/sessionsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";

const SessionsMonitor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sessions = useSelector((state) => state.sessions);

  const [search, setSearch] = useState("");

  // فلترة الجلسات
  const filtered = sessions.filter(
    (s) =>
      s.student.includes(search) ||
      s.patient.includes(search) ||
      s.id.includes(search)
  );

  return (
    <AnimatedWrapper>
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent mb-2">
          {t("Sessions.title") || "الجلسات"}
        </h1>
      </div>
      {/* البحث والفلاتر */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute top-2 sm:top-3 right-2 sm:right-3 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            placeholder={t("Sessions.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-2 border-sky-200/50 dark:border-dark-lighter px-8 sm:px-10 py-2 sm:py-2.5 text-sm sm:text-base 
              focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
              focus:outline-none bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          />
        </div>
        <select
          className="rounded-xl border-2 border-sky-200/50 dark:border-dark-lighter px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base 
            focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
            focus:outline-none bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <option>{t("Sessions.filterStatus")}</option>
        </select>
        <select
          className="rounded-xl border-2 border-sky-200/50 dark:border-dark-lighter px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base 
            focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
            focus:outline-none bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <option>{t("Sessions.filterStudent")}</option>
        </select>
        <select
          className="rounded-xl border-2 border-sky-200/50 dark:border-dark-lighter px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base 
            focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
            focus:outline-none bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <option>{t("Sessions.filterPatient")}</option>
        </select>
      </div>

      {/* الجلسات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filtered.map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="rounded-2xl shadow-lg p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 bg-white dark:bg-dark-light 
              border-2 border-sky-200/50 dark:border-dark-lighter hover:shadow-xl transition-all duration-300"
          >
            {/* العنوان + الحالة */}
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span
                className={`px-2 py-0.5 sm:px-3 sm:py-1 font-medium rounded-full text-white ${
                  session.status === "قيد التقدم"
                    ? "bg-emerald-500"
                    : session.status === "متوقفة مؤقتاً"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              >
                {session.status}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {t("Sessions.sessionId")}: {session.id}
              </span>
            </div>

            {/* الطالب + المريض */}
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              {t("Sessions.student")}: {session.student}
            </p>
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              {t("Sessions.patient")}: {session.patient}
            </p>

            {/* شريط التقدم */}
            <div className="w-full h-1.5 sm:h-2 rounded-full overflow-hidden bg-sky-200 dark:bg-slate-700">
              <div
                className={`h-full bg-blue-500 dark:bg-blue-400 ${
                  session.progress <= 0
                    ? "w-0"
                    : session.progress <= 25
                    ? "w-1/4"
                    : session.progress <= 50
                    ? "w-1/2"
                    : session.progress <= 75
                    ? "w-3/4"
                    : "w-full"
                }`}
              ></div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {t("Sessions.elapsed")}: {session.elapsed}
            </p>

            {/* الأزرار */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
              <button
                className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors
                  bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              >
                <Play size={14} /> {t("Sessions.join")}
              </button>
              <button
                onClick={() => dispatch(deleteSession(session.id))}
                className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm border border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700"
              >
                <Bell size={14} /> {t("Sessions.notify")}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </AnimatedWrapper>
  );
};

export default SessionsMonitor;
