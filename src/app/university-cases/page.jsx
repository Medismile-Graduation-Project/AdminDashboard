"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fetchCases } from "../../redux/features/clinicalCases/clinicalCasesSlice";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";

function UniversityCasesContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { cases, loading, error } = useSelector((state) => state.clinicalCases);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // جلب الحالات عند تحميل الصفحة
  // الـ backend يفترض أن يفلتر حسب الجامعة تلقائياً للدور university_admin
  useEffect(() => {
    dispatch(fetchCases({}));
  }, [dispatch]);

  // Helper function لتنسيق الحالة
  const getStatusBadge = (status) => {
    const statusMap = {
      new: { label: "جديدة", color: "bg-blue-500" },
      pending_assignment: { label: "في انتظار الإسناد", color: "bg-yellow-500" },
      assigned: { label: "مسندة", color: "bg-purple-500" },
      in_progress: { label: "قيد التنفيذ", color: "bg-indigo-500" },
      completed: { label: "مكتملة", color: "bg-green-500" },
      closed: { label: "مغلقة", color: "bg-gray-500" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "bg-gray-500" };
    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Helper function للأولوية
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { label: "منخفضة", color: "bg-green-500" },
      medium: { label: "متوسطة", color: "bg-yellow-500" },
      high: { label: "عالية", color: "bg-orange-500" },
      urgent: { label: "عاجلة", color: "bg-red-500" },
    };
    const priorityInfo = priorityMap[priority] || { label: priority, color: "bg-gray-500" };
    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${priorityInfo.color}`}>
        {priorityInfo.label}
      </span>
    );
  };

  if (!mounted)
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900"></div>
    );

  const isRtl = i18n?.language === "ar";

  return (
    <AnimatedWrapper>
      <div
        className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
              حالات الجامعة السريرية
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              عرض فقط - جميع حالات جامعتك
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 rounded-xl text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && cases.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
              <table
                className={`w-full text-sm text-slate-900 dark:text-slate-200 min-w-[900px] ${
                  isRtl ? "text-right" : "text-left"
                }`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                <thead className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 dark:from-dark-lighter dark:via-dark-light dark:to-dark-lighter text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">العنوان</th>
                    <th className="px-6 py-4 font-semibold">المريض</th>
                    <th className="px-6 py-4 font-semibold">الطالب</th>
                    <th className="px-6 py-4 font-semibold">المشرف</th>
                    <th className="px-6 py-4 font-semibold">الحالة</th>
                    <th className="px-6 py-4 font-semibold">الأولوية</th>
                    <th className="px-6 py-4 font-semibold">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {cases && cases.length > 0 ? (
                    cases.map((c, idx) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        className={`${
                          idx % 2 === 0
                            ? "bg-sky-50/50 dark:bg-dark-light/30"
                            : "bg-white dark:bg-dark-light"
                        } border-b border-sky-200/50 dark:border-dark-lighter hover:bg-gradient-to-r hover:from-sky-100/50 hover:to-sky-200/50 dark:hover:from-dark-lighter transition-all duration-300`}
                      >
                        <td className="px-6 py-4 font-medium">{c.title || "-"}</td>
                        <td className="px-6 py-4">{c.patient_name || "-"}</td>
                        <td className="px-6 py-4">{c.student_name || "-"}</td>
                        <td className="px-6 py-4">{c.supervisor_name || "-"}</td>
                        <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                        <td className="px-6 py-4">{getPriorityBadge(c.priority)}</td>
                        <td className="px-6 py-4">
                          {c.created_at
                            ? new Date(c.created_at).toLocaleDateString("ar-SA", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        لا توجد حالات
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && (
            <div className="sm:hidden grid gap-4 mt-4">
              {cases && cases.length > 0 ? (
                cases.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-5 border-2 border-sky-200/50 dark:border-dark-lighter"
                  >
                    <h3 className="font-bold text-lg mb-2">{c.title || "-"}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      المريض: {c.patient_name || "-"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      الطالب: {c.student_name || "-"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      المشرف: {c.supervisor_name || "-"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {getStatusBadge(c.status)}
                      {getPriorityBadge(c.priority)}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-500 dark:text-slate-400">
                  لا توجد حالات
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default function UniversityCasesPage() {
  return (
    <RoleGuard allowedRoles={["university_admin"]}>
      <UniversityCasesContent />
    </RoleGuard>
  );
}



