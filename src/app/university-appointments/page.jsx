"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Filter, Eye, X, Calendar, Clock, User, FileText, MapPin, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRtl } from "@/hooks/useRtl";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fetchAppointmentsAsync, fetchAppointmentByIdAsync, clearSelectedAppointment } from "../../redux/features/appointments/appointmentsSlice";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";

function UniversityAppointmentsContent() {
  const { t, i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();
  const { appointments, selectedAppointment, loading, loadingSelected, error } = useSelector((state) => state.appointments);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // State للفلترة والبحث
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [participantFilter, setParticipantFilter] = useState("all");
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
      scheduled: { label: "مجدول", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" },
      rescheduled: { label: "أعيد جدولته", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      completed: { label: "مكتمل", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      cancelled: { label: "ملغي", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
      no_show: { label: "عدم الحضور", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
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
      (apt.supervisor_name || "").toLowerCase().includes(searchLower) ||
      (apt.case_title || "").toLowerCase().includes(searchLower) ||
      (apt.notes || "").toLowerCase().includes(searchLower) ||
      (apt.title || "").toLowerCase().includes(searchLower);

    // فلترة الحالة
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;

    // فلترة التاريخ
    const appointmentDate = apt.appointment_date || apt.start_datetime || apt.scheduled_at;
    let matchesDate = true;
    if (appointmentDate) {
      const aptDate = new Date(appointmentDate);
      if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter);
        fromDate.setHours(0, 0, 0, 0);
        if (aptDate < fromDate) matchesDate = false;
      }
      if (dateToFilter) {
        const toDate = new Date(dateToFilter);
        toDate.setHours(23, 59, 59, 999);
        if (aptDate > toDate) matchesDate = false;
      }
    } else if (dateFromFilter || dateToFilter) {
      matchesDate = false; // إذا كان الموعد بدون تاريخ وكان هناك فلتر تاريخ
    }

    // فلترة المشارك
    let matchesParticipant = true;
    if (participantFilter !== "all") {
      if (participantFilter === "patient" && !apt.patient_name) matchesParticipant = false;
      if (participantFilter === "student" && !apt.student_name) matchesParticipant = false;
      if (participantFilter === "supervisor" && !apt.supervisor_name) matchesParticipant = false;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesParticipant;
  });

  if (!mounted)
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900"></div>
    );

  return (
    <AnimatedWrapper>
      <div
        className={`p-6 sm:p-8 min-h-screen ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {t("Appointments.title") || "مواعيد الجامعة"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                {filteredAppointments.length} {t("Appointments.noAppointments") ? "موعد" : "مواعيد"}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-dark-light rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className={`flex flex-wrap gap-4 items-end ${isRtl ? "flex-row-reverse" : ""}`}>
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("actions.search") || "بحث"}
                </label>
                <div className="relative">
                  <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} size={18} />
                  <input
                    type="text"
                    placeholder={t("Appointments.searchPlaceholder") || "ابحث عن موعد..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200`}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("Appointments.status") || "الحالة"}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">{t("actions.all") || "الكل"}</option>
                  <option value="scheduled">{t("Appointments.statuses.scheduled") || "مجدول"}</option>
                  <option value="rescheduled">{t("Appointments.statuses.rescheduled") || "أعيد جدولته"}</option>
                  <option value="completed">{t("Appointments.statuses.completed") || "مكتمل"}</option>
                  <option value="cancelled">{t("Appointments.statuses.cancelled") || "ملغي"}</option>
                  <option value="no_show">{t("Appointments.statuses.no_show") || "عدم الحضور"}</option>
                </select>
              </div>

              {/* Date From Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  من تاريخ
                </label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                />
              </div>

              {/* Date To Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                />
              </div>

              {/* Participant Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  المشارك
                </label>
                <select
                  value={participantFilter}
                  onChange={(e) => setParticipantFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">الكل</option>
                  <option value="patient">مريض</option>
                  <option value="student">طالب</option>
                  <option value="supervisor">مشرف</option>
                </select>
              </div>

              {/* Reset Filters */}
              <div>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFromFilter("");
                    setDateToFilter("");
                    setParticipantFilter("all");
                  }}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold text-sm"
                >
                  إعادة تعيين
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && appointments.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={32} />
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table
                className={`w-full text-sm text-slate-900 dark:text-slate-200 min-w-[900px] ${
                  isRtl ? "text-right" : "text-left"
                }`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">{t("Appointments.patient") || "المريض"}</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">{t("Appointments.student") || "الطالب"}</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">{t("Appointments.case") || "الحالة المرتبطة"}</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">{t("Appointments.date") || "تاريخ الموعد"}</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">{t("Appointments.status") || "الحالة"}</th>
                    <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">{t("Appointments.actions") || "الإجراءات"}</th>
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
                            ? "bg-white dark:bg-dark-light"
                            : "bg-slate-50/50 dark:bg-slate-800/50"
                        } border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200`}
                      >
                        <td className="px-6 py-4 font-medium">{apt.patient_name || "-"}</td>
                        <td className="px-6 py-4 font-medium">{apt.student_name || "-"}</td>
                        <td className="px-6 py-4 font-medium">{apt.supervisor_name || "-"}</td>
                        <td className="px-6 py-4 font-medium">{apt.case_title || "-"}</td>
                        <td className="px-6 py-4 font-medium">
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
                            className={`px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg transition-all duration-200 flex items-center gap-1.5 text-sm font-medium shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
                          >
                            <Eye size={16} />
                            {t("Appointments.viewDetails") || "عرض التفاصيل"}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-12 text-slate-500 dark:text-slate-400"
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
            <div className="sm:hidden grid gap-4 mt-6">
              {filteredAppointments && filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-light rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-700"
                  >
                    <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white">
                      موعد - {apt.patient_name || "-"}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">الطالب:</span> {apt.student_name || "-"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">المشرف:</span> {apt.supervisor_name || "-"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">الحالة:</span> {apt.case_title || "-"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">التاريخ:</span>{" "}
                        {apt.appointment_date || apt.start_datetime
                          ? new Date(apt.appointment_date || apt.start_datetime).toLocaleDateString("ar-SA")
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-4">{getStatusBadge(apt.status)}</div>
                    <button
                      onClick={() => handleViewDetails(apt.id)}
                      className={`w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <Eye size={16} />
                      {t("Appointments.viewDetails") || "عرض التفاصيل"}
                    </button>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-12 text-slate-500 dark:text-slate-400">
                  {t("Appointments.noAppointments") || "لا توجد مواعيد"}
                </p>
              )}
            </div>
          )}

          {/* Details Modal */}
          {showDetails && selectedAppointment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
              <div className="bg-white dark:bg-dark-light rounded-xl p-5 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className={`flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Appointments.viewDetails") || "تفاصيل الموعد"}
                  </h2>
                  <button
                    onClick={handleCloseDetails}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} className="text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                {loadingSelected ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={32} />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <User className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Appointments.patient") || "المريض"}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{selectedAppointment.patient_name || "-"}</p>
                        </div>
                      </div>
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <User className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Appointments.student") || "الطالب"}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{selectedAppointment.student_name || "-"}</p>
                        </div>
                      </div>
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <FileText className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Appointments.case") || "الحالة"}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{selectedAppointment.case_title || "-"}</p>
                        </div>
                      </div>
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <Calendar className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Appointments.date") || "التاريخ"}</p>
                          <p className="font-bold text-slate-900 dark:text-white">
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
                        <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <Clock className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Appointments.duration") || "المدة"}</p>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {selectedAppointment.duration_minutes} {t("Appointments.minutes") || "دقيقة"}
                            </p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{t("Appointments.status") || "الحالة"}</p>
                        <div>{getStatusBadge(selectedAppointment.status)}</div>
                      </div>
                      {selectedAppointment.location && (
                        <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <MapPin className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Appointments.location") || "الموقع"}</p>
                            <p className="font-bold text-slate-900 dark:text-white">{selectedAppointment.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedAppointment.notes && (
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <MessageSquare className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{t("Appointments.notes") || "ملاحظات"}</p>
                          <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-lg leading-relaxed">{selectedAppointment.notes}</p>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.description && (
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <MessageSquare className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{t("Appointments.description") || "الوصف"}</p>
                          <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-lg leading-relaxed">{selectedAppointment.description}</p>
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





