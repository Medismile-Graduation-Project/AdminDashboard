"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Search, Bell, Play } from "lucide-react";
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
    <div className="p-4 sm:p-6 min-h-screen">
      {/* البحث والفلاتر */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute top-2 sm:top-3 right-2 sm:right-3 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            placeholder={t("Sessions.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-sky-200 dark:border-slate-700 px-8 sm:px-10 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-1 sm:focus:ring-2 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        <select
          className="rounded-lg border border-sky-200 dark:border-slate-700 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-1 sm:focus:ring-2 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <option>{t("Sessions.filterStatus")}</option>
        </select>
        <select
          className="rounded-lg border border-sky-200 dark:border-slate-700 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-1 sm:focus:ring-2 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <option>{t("Sessions.filterStudent")}</option>
        </select>
        <select
          className="rounded-lg border border-sky-200 dark:border-slate-700 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-1 sm:focus:ring-2 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <option>{t("Sessions.filterPatient")}</option>
        </select>
      </div>

      {/* الجلسات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filtered.map((session) => (
          <div
            key={session.id}
            className="rounded-2xl shadow p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700"
          >
            {/* العنوان + الحالة */}
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span
                className="px-2 py-0.5 sm:px-3 sm:py-1 font-medium rounded-full"
                style={{
                  backgroundColor:
                    session.status === "قيد التقدم"
                      ? "#10b981"
                      : session.status === "متوقفة مؤقتاً"
                      ? "#ef4444"
                      : "#3b82f6",
                  color: "#ffffff",
                }}
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
                className="h-full bg-blue-500 dark:bg-blue-400"
                style={{
                  width: `${session.progress}%`,
                }}
              ></div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {t("Sessions.elapsed")}: {session.elapsed}
            </p>

            {/* الأزرار */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
              <button
                className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
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
          </div>
        ))}
      </div>
    </div>
    </AnimatedWrapper>
  );
};

export default SessionsMonitor;
