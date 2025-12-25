"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Filter, Eye, X, Calendar, Clock, User, FileText, MapPin, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fetchAppointmentsAsync, fetchAppointmentByIdAsync, clearSelectedAppointment } from "../../redux/features/appointments/appointmentsSlice";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";

export default function UniversityAppointmentsPage() {
  return (
    <RoleGuard>
      <UniversityAppointmentsContent />
    </RoleGuard>
  );
}

function UniversityAppointmentsContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { appointments, selectedAppointment, loading, loadingSelected, error } = useSelector((state) => state.appointments);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // State للفلترة والبحث
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(null);

  // جلب المواعيد عند تحميل الصفحة
  // الـ backend يفترض أن يفلتر حسب الجامعة تلقائياً للدور university_admin
  useEffect(() => {
    const params = {};
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    dispatch(fetchAppointmentsAsync(params));
  }, [dispatch, statusFilter]);

  // معالجة عرض التفاصيل
  const handleViewDetails = async (appointmentId) => {
    try {
      await dispatch(fetchAppointmentByIdAsync(appointmentId)).unwrap();
      setShowDetails(appointmentId);
    } catch (error) {
      toast.error(error || "فشل في جلب تفاصيل الموعد");
    }
  };

  // إغلاق تفاصيل الموعد
  const handleCloseDetails = () => {
    setShowDetails(null);
    dispatch(clearSelectedAppointment());
  };

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

  // فلترة المواعيد
  const filteredAppointments = appointments.filter((apt) => {
    // فلترة البحث
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (apt.patient_name || "").toLowerCase().includes(searchLower) ||
      (apt.student_name || "").toLowerCase().includes(searchLower) ||
      (apt.case_title || "").toLowerCase().includes(searchLower) ||
      (apt.notes || "").toLowerCase().includes(searchLower) ||
      (apt.title || "").toLowerCase().includes(searchLower);

    return matchesSearch;
  });

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
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
                {t("Appointments.title") || "مواعيد الجامعة"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {filteredAppointments.length} {t("Appointments.noAppointments") ? "موعد" : "مواعيد"}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-sky-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("actions.search") || "بحث"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder={t("Appointments.searchPlaceholder") || "ابحث عن موعد..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("Appointments.status") || "الحالة"}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">{t("actions.all") || "الكل"}</option>
                  <option value="scheduled">{t("Appointments.statuses.scheduled") || "مجدول"}</option>
                  <option value="confirmed">{t("Appointments.statuses.confirmed") || "مؤكد"}</option>
                  <option value="in_progress">{t("Appointments.statuses.in_progress") || "قيد التنفيذ"}</option>
                  <option value="completed">{t("Appointments.statuses.completed") || "مكتمل"}</option>
                  <option value="cancelled">{t("Appointments.statuses.cancelled") || "ملغي"}</option>
                  <option value="no_show">{t("Appointments.statuses.no_show") || "عدم الحضور"}</option>
                </select>
              </div>
            </div>
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
                    <th className="px-6 py-4 font-semibold">{t("Appointments.patient") || "المريض"}</th>
                    <th className="px-6 py-4 font-semibold">{t("Appointments.student") || "الطالب"}</th>
                    <th className="px-6 py-4 font-semibold">{t("Appointments.case") || "الحالة المرتبطة"}</th>
                    <th className="px-6 py-4 font-semibold">{t("Appointments.date") || "تاريخ الموعد"}</th>
                    <th className="px-6 py-4 font-semibold">{t("Appointments.status") || "الحالة"}</th>
                    <th className="px-6 py-4 font-semibold">{t("Appointments.actions") || "الإجراءات"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments && filteredAppointments.length > 0 ? (
                    filteredAppointments.map((apt, idx) => (
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
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewDetails(apt.id)}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-lg transition flex items-center gap-1 text-sm"
                          >
                            <Eye size={14} />
                            {t("Appointments.viewDetails") || "عرض التفاصيل"}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        {t("Appointments.noAppointments") || "لا توجد مواعيد"}
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
              {filteredAppointments && filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
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
                    <button
                      onClick={() => handleViewDetails(apt.id)}
                      className="mt-3 w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      {t("Appointments.viewDetails") || "عرض التفاصيل"}
                    </button>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-500 dark:text-slate-400">
                  {t("Appointments.noAppointments") || "لا توجد مواعيد"}
                </p>
              )}
            </div>
          )}

          {/* Details Modal */}
          {showDetails && selectedAppointment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Appointments.viewDetails") || "تفاصيل الموعد"}
                  </h2>
                  <button
                    onClick={handleCloseDetails}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X size={24} />
                  </button>
                </div>
                {loadingSelected ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <User className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Appointments.patient") || "المريض"}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedAppointment.patient_name || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <User className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Appointments.student") || "الطالب"}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedAppointment.student_name || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Appointments.case") || "الحالة"}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedAppointment.case_title || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Appointments.date") || "التاريخ"}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {selectedAppointment.appointment_date || selectedAppointment.start_datetime
                              ? new Date(selectedAppointment.appointment_date || selectedAppointment.start_datetime).toLocaleString("ar-SA", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </p>
                        </div>
                      </div>
                      {selectedAppointment.duration_minutes && (
                        <div className="flex items-start gap-3">
                          <Clock className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t("Appointments.duration") || "المدة"}</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {selectedAppointment.duration_minutes} {t("Appointments.minutes") || "دقيقة"}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Appointments.status") || "الحالة"}</p>
                          <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                        </div>
                      </div>
                      {selectedAppointment.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t("Appointments.location") || "الموقع"}</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{selectedAppointment.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedAppointment.notes && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t("Appointments.notes") || "ملاحظات"}</p>
                          <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">{selectedAppointment.notes}</p>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.description && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t("Appointments.description") || "الوصف"}</p>
                          <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">{selectedAppointment.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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





