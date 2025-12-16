"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { RefreshCw } from "lucide-react";
import { fetchAppointmentsAsync, clearError } from "../../redux/features/appointments/appointmentsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";

export default function AppointmentsPage() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dispatch = useDispatch();
  const appointmentsState = useSelector((state) => state.appointments);
  const appointments = appointmentsState?.appointments || [];
  const loading = appointmentsState?.loading || false;
  const error = appointmentsState?.error || null;

  const [searchTerm, setSearchTerm] = useState("");

  // جلب المواعيد عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchAppointmentsAsync());
  }, [dispatch]);

  // دالة إعادة جلب المواعيد
  const handleRefresh = () => {
    dispatch(fetchAppointmentsAsync());
  };

  // دالة لتنسيق التاريخ والوقت
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: "-", time: "-" };
    
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return { date: "-", time: "-" };
      
      const dateStr = date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      const timeStr = date.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      });
      
      return { date: dateStr, time: timeStr };
    } catch (error) {
      return { date: "-", time: "-" };
    }
  };

  // دالة لتنسيق نطاق الوقت (من - إلى)
  const formatTimeRange = (startDateTime, endDateTime, appointmentDate) => {
    // دعم الحقول المختلفة: start_datetime/end_datetime أو appointment_date
    const start = startDateTime || appointmentDate;
    if (!start) return { date: "-", startTime: "-", endTime: "-" };
    
    const startFormatted = formatDateTime(start);
    const endFormatted = endDateTime ? formatDateTime(endDateTime) : { date: "-", time: "-" };
    
    return {
      date: startFormatted.date,
      startTime: startFormatted.time,
      endTime: endFormatted.time,
    };
  };

  // دالة لتنسيق المدة بالدقائق
  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return "-";
    if (minutes < 60) return `${minutes} ${t("Appointments.minutes") || "دقيقة"}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} ${t("Appointments.hours") || "ساعة"}`;
    return `${hours} ${t("Appointments.hours") || "ساعة"} ${mins} ${t("Appointments.minutes") || "دقيقة"}`;
  };

  // البحث والفلترة - البيانات محولة بالفعل من Redux slice
  const filteredAppointments = appointments.filter((a) => {
    if (!a) return false;
    
    const patientName = a.patient_name || "-";
    const studentName = a.student_name || "-";
    const caseTitle = a.case_title || "-";
    const title = a.title || "";
    const description = a.description || "";
    const appointmentType = a.appointment_type || "";
    const status = a.status || "";
    const location = a.location || "";
    const notes = a.notes || "";
    
    // البحث في نطاق الوقت
    const timeRange = formatTimeRange(a.start_datetime, a.end_datetime, a.appointment_date);
    const fullDate = `${timeRange.date} ${timeRange.startTime} ${timeRange.endTime}`;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      patientName.toLowerCase().includes(searchLower) ||
      studentName.toLowerCase().includes(searchLower) ||
      caseTitle.toLowerCase().includes(searchLower) ||
      title.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower) ||
      appointmentType.toLowerCase().includes(searchLower) ||
      status.toLowerCase().includes(searchLower) ||
      location.toLowerCase().includes(searchLower) ||
      notes.toLowerCase().includes(searchLower) ||
      fullDate.includes(searchLower)
    );
  });

  // تحويل البيانات إلى تنسيق موحد للعرض - البيانات محولة بالفعل
  const formatAppointment = (a) => {
    if (!a) return null;
    
    const timeRange = formatTimeRange(a.start_datetime, a.end_datetime, a.appointment_date);
    
    return {
      id: a.id,
      title: a.title || "-",
      description: a.description || "-",
      patient: a.patient_name || "-",
      student: a.student_name || "-",
      case: a.case_title || "-",
      appointment_type: a.appointment_type || "-",
      appointment_date: a.appointment_date || a.start_datetime,
      start_datetime: a.start_datetime || a.appointment_date,
      end_datetime: a.end_datetime,
      date: timeRange.date,
      startTime: timeRange.startTime,
      endTime: timeRange.endTime,
      duration: formatDuration(a.duration_minutes),
      duration_minutes: a.duration_minutes,
      location: a.location || "-",
      notes: a.notes || "-",
      status: a.status || "-",
      is_archived: a.is_archived || false,
      created_at: a.created_at,
      updated_at: a.updated_at,
    };
  };

  if (!mounted)
    return (
      <div className="p-4 min-h-screen bg-sky-50"></div>
    );

  const isRtl = i18n?.language === "ar";

  return (
    <AnimatedWrapper>
      <div className={`p-4 sm:p-6 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-[1300px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 dark:text-white">
              {t("Appointments.title")}
            </h1>

            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder={t("Appointments.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl transition disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">{t("actions.refresh") || "تحديث"}</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-600 dark:border-red-500 rounded-xl text-red-600 dark:text-red-400">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-600 hover:text-red-600/80"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
              {t("Appointments.loading") || "جاري التحميل..."}
            </div>
          )}

          {/* Debug Info - يمكن إزالته لاحقاً */}
          {process.env.NODE_ENV === "development" && appointments.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              <strong>عدد المواعيد:</strong> {appointments.length} | 
              <strong> عدد النتائج بعد البحث:</strong> {filteredAppointments.length}
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-sky-200 dark:border-slate-700 shadow-lg">
              <table className="w-full text-sm text-slate-900 dark:text-slate-200 min-w-[900px]">
                <thead className="bg-gradient-to-r from-blue-900 to-blue-600 dark:from-slate-800 dark:to-slate-700 text-white">
                  <tr>
                    <th className="px-4 py-3">{t("Appointments.title") || "العنوان"}</th>
                    <th className="px-4 py-3">{t("Appointments.patient")}</th>
                    <th className="px-4 py-3">{t("Appointments.student") || "الطالب"}</th>
                    <th className="px-4 py-3">{t("Appointments.case") || "الحالة السريرية"}</th>
                    <th className="px-4 py-3">{t("Appointments.date")}</th>
                    <th className="px-4 py-3">{t("Appointments.time")}</th>
                    <th className="px-4 py-3">{t("Appointments.type") || "النوع"}</th>
                    <th className="px-4 py-3">{t("Appointments.status")}</th>
                    <th className="px-4 py-3">{t("Appointments.location") || "الموقع"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((a, idx) => {
                      const formatted = formatAppointment(a);
                      if (!formatted) return null;
                      
                      return (
                        <tr
                          key={formatted.id || idx}
                          className={`border-b transition ${
                            idx % 2 === 0
                              ? "bg-sky-50 dark:bg-slate-800/50"
                              : "bg-white dark:bg-slate-800"
                          } hover:bg-gradient-to-r hover:from-sky-200/30 hover:to-blue-600/30 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50`}
                        >
                          <td className="px-4 py-3 font-medium">{formatted.title}</td>
                          <td className="px-4 py-3">{formatted.patient}</td>
                          <td className="px-4 py-3">{formatted.student}</td>
                          <td className="px-4 py-3">{formatted.case}</td>
                          <td className="px-4 py-3">{formatted.date}</td>
                          <td className="px-4 py-3">
                            {formatted.startTime !== "-" && formatted.endTime !== "-" 
                              ? `${formatted.startTime} - ${formatted.endTime}` 
                              : formatted.startTime !== "-" 
                                ? formatted.startTime 
                                : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {formatted.appointment_type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                formatted.status === "confirmed" || formatted.status === "completed"
                                  ? "bg-green-600/20 text-green-600"
                                  : formatted.status === "cancelled" || formatted.status === "no_show"
                                  ? "bg-red-600/20 text-red-600"
                                  : formatted.status === "in_progress"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                              }`}
                            >
                              {formatted.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{formatted.location}</td>
                        </tr>
                      );
                    }).filter(Boolean)
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        {appointments.length === 0
                          ? t("Appointments.noAppointments")
                          : "لا توجد نتائج مطابقة للبحث"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards for small screens */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((a, idx) => {
                  const formatted = formatAppointment(a);
                  if (!formatted) return null;
                  
                  return (
                    <article
                      key={formatted.id || idx}
                      className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4 border border-sky-200 dark:border-slate-700"
                    >
                      <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">{formatted.title}</h3>
                      
                      <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <p>
                          <span className="font-medium">{t("Appointments.patient")}:</span> {formatted.patient}
                        </p>
                        <p>
                          <span className="font-medium">{t("Appointments.student") || "الطالب"}:</span> {formatted.student}
                        </p>
                        {formatted.case !== "-" && (
                          <p>
                            <span className="font-medium">{t("Appointments.case") || "الحالة"}:</span> {formatted.case}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">{t("Appointments.date")}:</span> {formatted.date}
                        </p>
                        <p>
                          <span className="font-medium">{t("Appointments.time")}:</span>{" "}
                          {formatted.startTime !== "-" && formatted.endTime !== "-" 
                            ? `${formatted.startTime} - ${formatted.endTime}` 
                            : formatted.startTime !== "-" 
                              ? formatted.startTime 
                              : "-"}
                        </p>
                        {formatted.appointment_type !== "-" && (
                          <p>
                            <span className="font-medium">{t("Appointments.type") || "النوع"}:</span>{" "}
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {formatted.appointment_type}
                            </span>
                          </p>
                        )}
                        {formatted.duration !== "-" && (
                          <p>
                            <span className="font-medium">{t("Appointments.duration") || "المدة"}:</span> {formatted.duration}
                          </p>
                        )}
                        {formatted.location !== "-" && (
                          <p>
                            <span className="font-medium">{t("Appointments.location") || "الموقع"}:</span> {formatted.location}
                          </p>
                        )}
                        {formatted.notes !== "-" && (
                            <p className="mt-2 text-slate-500 dark:text-slate-400">
                            <span className="font-medium">{t("Appointments.notes")}:</span> {formatted.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            formatted.status === "confirmed" || formatted.status === "completed"
                              ? "bg-green-600/20 text-green-600"
                              : formatted.status === "cancelled" || formatted.status === "no_show"
                              ? "bg-red-600/20 text-red-600"
                              : formatted.status === "in_progress"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                          }`}
                        >
                          {formatted.status}
                        </span>
                      </div>
                    </article>
                  );
                }).filter(Boolean)
              ) : (
                <div className="col-span-2 text-center py-10 text-slate-900/60">
                  {appointments.length === 0
                    ? t("Appointments.noAppointments")
                    : "لا توجد نتائج مطابقة للبحث"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}