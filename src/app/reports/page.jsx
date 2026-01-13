"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  X,
  Save,
  Loader2,
  FileText,
  Calendar,
  User,
  Download,
  PlusCircle,
  FileSpreadsheet,
} from "lucide-react";
import {
  fetchReportsAsync,
  createReportAsync,
  updateReportAsync,
  deleteReportAsync,
  fetchReportByIdAsync,
  clearError,
  setFilters,
  clearFilters,
} from "../../redux/features/reports/reportsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";
import RoleGuard from "@/components/RoleGuard";
import { useRole } from "@/hooks/useRole";
import { fetchUniversityAdminProfile } from "@/services/universityApi";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  return (
    <RoleGuard>
      <ReportsContent />
    </RoleGuard>
  );
}

function ReportsContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useRole();
  const reportsState = useSelector((state) => state.reports);
  const reports = reportsState?.reports || [];
  const selectedReport = reportsState?.selectedReport;
  const loading = reportsState?.loading || false;
  const loadingSelected = reportsState?.loadingSelected || false;
  const error = reportsState?.error || null;
  const filters = reportsState?.filters || {};

  const [mounted, setMounted] = useState(false);
  const [universityId, setUniversityId] = useState(null);
  useEffect(() => setMounted(true), []);

  // State
  const [showDetails, setShowDetails] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    report_type: "clinical_case",
    target_type: "case",
    target_id: "",
    title: "",
    description: "",
    content: "",
    attachments: "",
  });

  // جلب university_id من user أو Profile
  useEffect(() => {
    const loadUniversityId = async () => {
      if (!user) return;

      // محاولة جلب university_id من user object
      let universityId = user?.university_id || user?.university;
      
      // إذا كان object، نستخرج id
      if (!universityId && user?.university && typeof user.university === 'object') {
        universityId = user.university.id;
      }

      // إذا لم يكن موجوداً، نجرب جلب Profile من API
      if (!universityId && (user?.role === "university_admin" || user?.role === "college_admin")) {
        try {
          const profile = await fetchUniversityAdminProfile();
          
          // استخراج university_id من Profile
          if (profile?.university) {
            if (typeof profile.university === 'object') {
              universityId = profile.university.id || profile.university;
            } else {
              universityId = profile.university;
            }
          } else if (profile?.university_id) {
            universityId = profile.university_id;
          }

          // حفظ في localStorage إذا تم جلبها
          if (universityId) {
            const updatedUser = { ...user, university_id: universityId };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("Error fetching university profile:", error);
        }
      }

      if (universityId) {
        setUniversityId(universityId);
      }
    };

    if (user) {
      loadUniversityId();
    }
  }, [user]);

  // جلب التقارير عند تحميل الصفحة
  useEffect(() => {
    if (!user) return; // انتظر حتى يتم تحميل المستخدم
    
    const params = {};
    if (reportTypeFilter !== "all") {
      params.report_type = reportTypeFilter;
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (targetTypeFilter !== "all") {
      params.target_type = targetTypeFilter;
    }
    
    dispatch(fetchReportsAsync(params));
  }, [dispatch, user, reportTypeFilter, statusFilter, targetTypeFilter]);

  // عرض رسائل الخطأ
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // معالجة عرض التفاصيل
  // ⚠️ Backend يتحقق تلقائياً من أن التقرير يخص جامعة المستخدم
  // إذا كان التقرير من جامعة أخرى، يعيد Backend خطأ 403/404
  const handleViewDetails = async (reportId) => {
    try {
      await dispatch(fetchReportByIdAsync(reportId)).unwrap();
      setShowDetails(reportId);
    } catch (error) {
      // معالجة خطأ الوصول لتقرير من جامعة أخرى
      const errorMessage = error?.response?.data?.message || error?.message || error || t("Reports.fetchDetailsError");
      toast.error(errorMessage);
    }
  };

  // إغلاق تفاصيل التقرير
  const handleCloseDetails = () => {
    setShowDetails(null);
  };

  // معالجة حذف تقرير
  const handleDelete = async (reportId) => {
    if (!window.confirm(t("Reports.confirmDelete"))) return;

    try {
      await dispatch(deleteReportAsync(reportId)).unwrap();
      toast.success(t("Reports.deleteSuccess"));
      
      // إعادة جلب التقارير
      const params = {};
      if (reportTypeFilter !== "all") {
        params.report_type = reportTypeFilter;
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (targetTypeFilter !== "all") {
        params.target_type = targetTypeFilter;
      }
      dispatch(fetchReportsAsync(params));
    } catch (error) {
      toast.error(error || t("Reports.deleteError"));
    }
  };

  // فلترة التقارير
  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (report.title || "").toLowerCase().includes(searchLower) ||
      (report.description || "").toLowerCase().includes(searchLower) ||
      (report.student_name || "").toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  // Helper function لتنسيق نوع التقرير
  const getReportTypeBadge = (type) => {
    const typeMap = {
      academic: { label: t("Reports.types.academic"), color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" },
      clinical: { label: t("Reports.types.clinical"), color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      progress: { label: t("Reports.types.progress"), color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      summary: { label: t("Reports.types.summary"), color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    };
    const typeInfo = typeMap[type] || { label: type, color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  // Helper function لتنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // تصدير التقارير إلى Excel
  const handleExportExcel = () => {
    if (filteredReports.length === 0) {
      toast.error("لا توجد تقارير للتصدير");
      return;
    }

    try {
      // تحضير البيانات للتصدير
      const excelData = filteredReports.map((report) => ({
        "العنوان": report.title || "-",
        "الوصف": report.description || "-",
        "نوع التقرير": report.report_type === "clinical_case" ? "حالة سريرية" : report.report_type || "-",
        "الحالة": 
          report.status === "draft" ? "مسودة" :
          report.status === "submitted" ? "مقدمة" :
          report.status === "approved" ? "موافق عليها" :
          report.status === "rejected" ? "مرفوضة" :
          report.status === "locked" ? "مقفلة" :
          report.status || "-",
        "الطالب": report.student_name || "-",
        "المشرف": report.supervisor_name || "-",
        "الجامعة": report.university_name || "-",
        "المؤلف": report.author_name || "-",
        "دور المؤلف": 
          report.author_role === "student" ? "طالب" :
          report.author_role === "supervisor" ? "مشرف" :
          report.author_role === "university_admin" ? "مسؤول جامعة" :
          report.author_role || "-",
        "النتيجة": report.score !== null && report.score !== undefined ? `${report.score}/100` : "-",
        "ملاحظات المراجعة": report.review_notes || "-",
        "الموافق عليه": report.approved_by_name || "-",
        "تاريخ الإنشاء": report.created_at ? formatDate(report.created_at) : "-",
        "تاريخ التقديم": report.submitted_at ? formatDate(report.submitted_at) : "-",
        "تاريخ الموافقة": report.approved_at ? formatDate(report.approved_at) : "-",
        "تاريخ القفل": report.locked_at ? formatDate(report.locked_at) : "-",
      }));

      // إنشاء workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "التقارير");

      // تحديد عرض الأعمدة
      const colWidths = [
        { wch: 25 }, // العنوان
        { wch: 30 }, // الوصف
        { wch: 15 }, // نوع التقرير
        { wch: 12 }, // الحالة
        { wch: 20 }, // الطالب
        { wch: 20 }, // المشرف
        { wch: 25 }, // الجامعة
        { wch: 20 }, // المؤلف
        { wch: 15 }, // دور المؤلف
        { wch: 10 }, // النتيجة
        { wch: 30 }, // ملاحظات المراجعة
        { wch: 20 }, // الموافق عليه
        { wch: 20 }, // تاريخ الإنشاء
        { wch: 20 }, // تاريخ التقديم
        { wch: 20 }, // تاريخ الموافقة
        { wch: 20 }, // تاريخ القفل
      ];
      ws["!cols"] = colWidths;

      // تصدير الملف
      const fileName = `التقارير_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`تم تصدير ${filteredReports.length} تقرير بنجاح`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("فشل في تصدير التقارير إلى Excel");
    }
  };

  if (!mounted) {
    return <div className="p-4 min-h-screen bg-sky-50 dark:bg-dark"></div>;
  }

  const isRtl = i18n?.language === "ar";

  return (
    <AnimatedWrapper>
      <div
        className={`p-4 sm:p-6 lg:p-8 min-h-screen bg-sky-50 dark:bg-dark ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className={`mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {t("Reports.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                {filteredReports.length} {t("Reports.total")}
              </p>
            </div>
            {filteredReports.length > 0 && (
              <button
                onClick={handleExportExcel}
                className={`inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <FileSpreadsheet size={18} />
                <span>تصدير Excel</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-dark-light rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className={`flex flex-wrap gap-4 items-end ${isRtl ? "flex-row-reverse" : ""}`}>
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("actions.search")}
                </label>
                <div className="relative">
                  <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} size={18} />
                  <input
                    type="text"
                    placeholder={t("Reports.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200`}
                  />
                </div>
              </div>

              {/* Report Type Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("Reports.type")}
                </label>
                <select
                  value={reportTypeFilter}
                  onChange={(e) => setReportTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">{t("actions.all")}</option>
                  <option value="academic">{t("Reports.types.academic")}</option>
                  <option value="clinical">{t("Reports.types.clinical")}</option>
                  <option value="progress">{t("Reports.types.progress")}</option>
                  <option value="summary">{t("Reports.types.summary")}</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("Reports.status")}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">{t("actions.all")}</option>
                  <option value="draft">مسودة</option>
                  <option value="submitted">مقدمة</option>
                  <option value="approved">موافق عليها</option>
                  <option value="rejected">مرفوضة</option>
                  <option value="locked">مقفلة</option>
                </select>
              </div>

              {/* Target Type Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  نوع الهدف
                </label>
                <select
                  value={targetTypeFilter}
                  onChange={(e) => setTargetTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">{t("actions.all")}</option>
                  <option value="case">حالة سريرية</option>
                  <option value="appointment">موعد</option>
                  <option value="session">جلسة</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-600 dark:border-red-500 rounded-xl text-red-600 dark:text-red-400">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => dispatch(clearError())} className="text-red-600 hover:text-red-600/80">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && reports.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
            </div>
          )}

          {/* Reports List */}
          {!loading && (
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-sky-200 dark:border-slate-700">
                  <FileText size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                  <p className="text-sky-600 dark:text-sky-400 text-lg">
                    {t("Reports.noReports")}
                  </p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-light rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className={`flex flex-col sm:flex-row justify-between gap-4 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
                      <div className="flex-1">
                        <div className={`flex items-center gap-3 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                            <Link 
                              href={`/reports/${report.id}`}
                              className="hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                            >
                              {report.title || "-"}
                            </Link>
                          </h3>
                          {getReportTypeBadge(report.report_type)}
                          {report.status && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              report.status === "draft" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                              report.status === "submitted" ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" :
                              report.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                              report.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                              report.status === "locked" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                              "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            }`}>
                              {report.status === "draft" ? "مسودة" :
                               report.status === "submitted" ? "مقدمة" :
                               report.status === "approved" ? "موافق عليها" :
                               report.status === "rejected" ? "مرفوضة" :
                               report.status === "locked" ? "مقفلة" :
                               report.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                          {report.description || "-"}
                        </p>
                        <div className={`flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                          {report.student_name && (
                            <span className={`flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <User size={16} className="text-sky-600 dark:text-sky-400" />
                              <strong className="font-semibold">{t("Reports.student")}:</strong> {report.student_name}
                            </span>
                          )}
                          {report.supervisor_name && (
                            <span className={`flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <User size={16} className="text-sky-600 dark:text-sky-400" />
                              <strong className="font-semibold">المشرف:</strong> {report.supervisor_name}
                            </span>
                          )}
                          {report.university_name && (
                            <span className={`flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <User size={16} className="text-sky-600 dark:text-sky-400" />
                              <strong className="font-semibold">الجامعة:</strong> {report.university_name}
                            </span>
                          )}
                          {report.score !== null && report.score !== undefined && (
                            <span className={`flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <FileText size={16} className="text-sky-600 dark:text-sky-400" />
                              <strong className="font-semibold">النتيجة:</strong> {report.score}/100
                            </span>
                          )}
                          <span className={`flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                            <Calendar size={16} className="text-sky-600 dark:text-sky-400" />
                            <strong className="font-semibold">{t("Reports.date")}:</strong> {formatDate(report.created_at)}
                          </span>
                        </div>
                        {report.file_url && (
                          <div className="mt-3">
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
                            >
                              <Download size={16} />
                              {t("Reports.download")}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className={`flex gap-2 ${isRtl ? "flex-row-reverse sm:flex-col-reverse" : "sm:flex-col"}`}>
                        <button
                          onClick={() => handleViewDetails(report.id)}
                          className={`px-4 py-2 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all duration-200 text-sm flex items-center gap-1.5 font-medium shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
                        >
                          <Eye size={16} />
                          {t("Reports.viewDetails")}
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className={`px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 text-sm flex items-center gap-1.5 font-medium shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
                        >
                          <Trash2 size={16} />
                          {t("Reports.delete")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Details Modal */}
          {showDetails && selectedReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
              <div className="bg-white dark:bg-dark-light rounded-xl p-5 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className={`flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Reports.detailsTitle")}
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
                        <FileText className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Reports.titleLabel")}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{selectedReport.title || "-"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{t("Reports.typeLabel")}</p>
                        <div>{getReportTypeBadge(selectedReport.report_type)}</div>
                      </div>
                      {selectedReport.student_name && (
                        <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <User className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Reports.student")}</p>
                            <p className="font-bold text-slate-900 dark:text-white">{selectedReport.student_name}</p>
                          </div>
                        </div>
                      )}
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <Calendar className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("Reports.date")}</p>
                          <p className="font-bold text-slate-900 dark:text-white">{formatDate(selectedReport.created_at)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{t("Reports.status")}</p>
                        {selectedReport.status ? (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            selectedReport.status === "draft" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            selectedReport.status === "submitted" ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" :
                            selectedReport.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                            selectedReport.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                            selectedReport.status === "locked" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                            "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {selectedReport.status === "draft" ? "مسودة" :
                             selectedReport.status === "submitted" ? "مقدمة" :
                             selectedReport.status === "approved" ? "موافق عليها" :
                             selectedReport.status === "rejected" ? "مرفوضة" :
                             selectedReport.status === "locked" ? "مقفلة" :
                             selectedReport.status}
                          </span>
                        ) : (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${selectedReport.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"}`}>
                            {selectedReport.is_active ? t("Reports.active") : t("Reports.inactive")}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedReport.description && (
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <FileText className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{t("Reports.description")}</p>
                          <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-lg leading-relaxed">{selectedReport.description}</p>
                        </div>
                      </div>
                    )}
                    {selectedReport.file_url && (
                      <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <Download className="text-sky-600 dark:text-sky-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{t("Reports.fileUrl")}</p>
                          <a
                            href={selectedReport.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 break-all font-medium transition-colors"
                          >
                            {selectedReport.file_url}
                          </a>
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


