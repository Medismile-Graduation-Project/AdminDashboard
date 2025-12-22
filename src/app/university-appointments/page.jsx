"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fetchAppointmentsAsync } from "../../redux/features/appointments/appointmentsSlice";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";

function UniversityAppointmentsContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector((state) => state.appointments);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // جلب المواعيد عند تحميل الصفحة
  // الـ backend يفترض أن يفلتر حسب الجامعة تلقائياً للدور university_admin
  useEffect(() => {
    dispatch(fetchAppointmentsAsync({}));
  }, [dispatch]);

  // Helper function لتنسيق حالة الموعد
  const getStatusBadge = (status) => {
    const statusMap = {
      scheduled: { label: "مجدول", color: "bg-blue-500" },
      confirmed: { label: "مؤكد", color: "bg-green-500" },
      in_progress: { label: "قيد التنفيذ", color: "bg-indigo-500" },
      completed: { label: "مكتمل", color: "bg-green-600" },
      cancelled: { label: "ملغي", color: "bg-red-500" },
      no_show: { label: "عدم الحضور", color: "bg-orange-500" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "bg-gray-500" };
    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${statusInfo.color}`}>
        {statusInfo.label}
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
              مواعيد الجامعة
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              عرض فقط - جميع مواعيد جامعتك
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 rounded-xl text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && appointments.length === 0 && (
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
                    <th className="px-6 py-4 font-semibold">المريض</th>
                    <th className="px-6 py-4 font-semibold">الطالب</th>
                    <th className="px-6 py-4 font-semibold">الحالة المرتبطة</th>
                    <th className="px-6 py-4 font-semibold">تاريخ الموعد</th>
                    <th className="px-6 py-4 font-semibold">الحالة</th>
                    <th className="px-6 py-4 font-semibold">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments && appointments.length > 0 ? (
                    appointments.map((apt, idx) => (
                      <motion.tr
                        key={apt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        className={`${
                          idx % 2 === 0
                            ? "bg-sky-50/50 dark:bg-dark-light/30"
                            : "bg-white dark:bg-dark-light"
                        } border-b border-sky-200/50 dark:border-dark-lighter hover:bg-gradient-to-r hover:from-sky-100/50 hover:to-sky-200/50 dark:hover:from-dark-lighter transition-all duration-300`}
                      >
                        <td className="px-6 py-4">{apt.patient_name || "-"}</td>
                        <td className="px-6 py-4">{apt.student_name || "-"}</td>
                        <td className="px-6 py-4">{apt.case_title || "-"}</td>
                        <td className="px-6 py-4">
                          {apt.appointment_date || apt.start_datetime
                            ? new Date(apt.appointment_date || apt.start_datetime).toLocaleDateString("ar-SA", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {apt.notes || "-"}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        لا توجد مواعيد
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
              {appointments && appointments.length > 0 ? (
                appointments.map((apt) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-5 border-2 border-sky-200/50 dark:border-dark-lighter"
                  >
                    <h3 className="font-bold text-lg mb-2">
                      موعد - {apt.patient_name || "-"}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      الطالب: {apt.student_name || "-"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      الحالة: {apt.case_title || "-"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      التاريخ:{" "}
                      {apt.appointment_date || apt.start_datetime
                        ? new Date(apt.appointment_date || apt.start_datetime).toLocaleDateString("ar-SA")
                        : "-"}
                    </p>
                    <div className="mt-3">{getStatusBadge(apt.status)}</div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-500 dark:text-slate-400">
                  لا توجد مواعيد
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default function UniversityAppointmentsPage() {
  return (
    <RoleGuard allowedRoles={["university_admin"]}>
      <UniversityAppointmentsContent />
    </RoleGuard>
  );
}



