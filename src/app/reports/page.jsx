"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  PlusCircle,
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
} from "lucide-react";
import {
  fetchReportsAsync,
  createReportAsync,
  deleteReportAsync,
  fetchReportByIdAsync,
  clearError,
  setFilters,
  clearFilters,
} from "../../redux/features/reports/reportsSlice";
import { fetchStudentsAsync } from "../../redux/features/students/studentsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";
import RoleGuard from "@/components/RoleGuard";

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
  const reportsState = useSelector((state) => state.reports);
  const reports = reportsState?.reports || [];
  const selectedReport = reportsState?.selectedReport;
  const loading = reportsState?.loading || false;
  const loadingSelected = reportsState?.loadingSelected || false;
  const error = reportsState?.error || null;
  const filters = reportsState?.filters || {};

  const studentsState = useSelector((state) => state.students);
  const students = studentsState?.students || [];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // State للنموذج
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [isActiveFilter, setIsActiveFilter] = useState("all");

  // جلب معلومات المستخدم
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
    setUserLoaded(true);
  }, []);

  const [formData, setFormData] = useState({
    student_id: "",
    report_type: "academic", // academic, clinical, progress, summary
    title: "",
    description: "",
    file_url: "",
    is_active: true,
  });

  // جلب التقارير والطلاب عند تحميل الصفحة
  useEffect(() => {
    if (!userLoaded) return; // انتظر حتى يتم تحميل المستخدم
    
    const params = {};
    if (reportTypeFilter !== "all") {
      params.report_type = reportTypeFilter;
    }
    if (isActiveFilter !== "all") {
      params.is_active = isActiveFilter === "active";
    }
    dispatch(fetchReportsAsync(params));
    dispatch(fetchStudentsAsync());
  }, [dispatch, userLoaded, reportTypeFilter, isActiveFilter]);

  // عرض رسائل الخطأ
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // معالجة عرض التفاصيل
  const handleViewDetails = async (reportId) => {
    try {
      await dispatch(fetchReportByIdAsync(reportId)).unwrap();
      setShowDetails(reportId);
    } catch (error) {
      toast.error(error || "فشل في جلب تفاصيل التقرير");
    }
  };

  // إغلاق تفاصيل التقرير
  const handleCloseDetails = () => {
    setShowDetails(null);
  };

  // معالجة إضافة تقرير جديد
  const handleAdd = () => {
    setFormData({
      student_id: "",
      report_type: "academic",
      title: "",
      description: "",
      file_url: "",
      is_active: true,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // التحقق من الحقول المطلوبة
      if (!formData.student_id || !formData.title || !formData.report_type) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        setSubmitLoading(false);
        return;
      }

      await dispatch(createReportAsync(formData)).unwrap();
      toast.success("تم إنشاء التقرير بنجاح");
      setShowForm(false);
      
      // إعادة تعيين النموذج
      setFormData({
        student_id: "",
        report_type: "academic",
        title: "",
        description: "",
        file_url: "",
        is_active: true,
      });

      // إعادة جلب التقارير
      const params = {};
      if (reportTypeFilter !== "all") {
        params.report_type = reportTypeFilter;
      }
      if (isActiveFilter !== "all") {
        params.is_active = isActiveFilter === "active";
      }
      dispatch(fetchReportsAsync(params));
    } catch (error) {
      toast.error(error || "فشل في إنشاء التقرير");
    } finally {
      setSubmitLoading(false);
    }
  };

  // معالجة حذف تقرير
  const handleDelete = async (reportId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التقرير؟")) return;

    try {
      await dispatch(deleteReportAsync(reportId)).unwrap();
      toast.success("تم حذف التقرير بنجاح");
      
      // إعادة جلب التقارير
      const params = {};
      if (reportTypeFilter !== "all") {
        params.report_type = reportTypeFilter;
      }
      if (isActiveFilter !== "all") {
        params.is_active = isActiveFilter === "active";
      }
      dispatch(fetchReportsAsync(params));
    } catch (error) {
      toast.error(error || "فشل في حذف التقرير");
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
      academic: { label: "أكاديمي", color: "bg-blue-500" },
      clinical: { label: "سريري", color: "bg-green-500" },
      progress: { label: "تقدم", color: "bg-yellow-500" },
      summary: { label: "ملخص", color: "bg-purple-500" },
    };
    const typeInfo = typeMap[type] || { label: type, color: "bg-gray-500" };
    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${typeInfo.color}`}>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
                {t("Reports.title") || "التقارير"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {filteredReports.length} {t("Reports.total") || "تقرير"}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-sky-600 to-sky-700 
                hover:from-sky-700 hover:to-sky-800 dark:from-sky-500 dark:to-sky-600 dark:hover:from-sky-600 dark:hover:to-sky-700 
                text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={18} />
              <span>{t("Reports.addReport") || "إضافة تقرير جديد"}</span>
            </motion.button>
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
                    placeholder={t("Reports.searchPlaceholder") || "ابحث عن تقرير..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Report Type Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("Reports.type") || "نوع التقرير"}
                </label>
                <select
                  value={reportTypeFilter}
                  onChange={(e) => setReportTypeFilter(e.target.value)}
                  className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">{t("actions.all") || "الكل"}</option>
                  <option value="academic">{t("Reports.types.academic") || "أكاديمي"}</option>
                  <option value="clinical">{t("Reports.types.clinical") || "سريري"}</option>
                  <option value="progress">{t("Reports.types.progress") || "تقدم"}</option>
                  <option value="summary">{t("Reports.types.summary") || "ملخص"}</option>
                </select>
              </div>

              {/* Active Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("Reports.status") || "الحالة"}
                </label>
                <select
                  value={isActiveFilter}
                  onChange={(e) => setIsActiveFilter(e.target.value)}
                  className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">{t("actions.all") || "الكل"}</option>
                  <option value="active">{t("Reports.active") || "نشط"}</option>
                  <option value="inactive">{t("Reports.inactive") || "غير نشط"}</option>
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
                    {t("Reports.noReports") || "لا توجد تقارير"}
                  </p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border-2 border-sky-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 transition"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                            {report.title || "-"}
                          </h3>
                          {getReportTypeBadge(report.report_type)}
                          {!report.is_active && (
                            <span className="px-2 py-1 rounded text-xs bg-gray-500 text-white">
                              غير نشط
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                          {report.description || "-"}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                          {report.student_name && (
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              <strong>{t("Reports.student") || "الطالب"}:</strong> {report.student_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            <strong>{t("Reports.date") || "التاريخ"}:</strong> {formatDate(report.created_at)}
                          </span>
                        </div>
                        {report.file_url && (
                          <div className="mt-2">
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                            >
                              <Download size={14} />
                              {t("Reports.download") || "تحميل الملف"}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleViewDetails(report.id)}
                          className="px-3 py-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-900/50 transition text-sm flex items-center gap-1"
                        >
                          <Eye size={16} />
                          {t("Reports.viewDetails") || "عرض التفاصيل"}
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition text-sm flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          {t("Reports.delete") || "حذف"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Create Report Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Reports.addReport") || "إضافة تقرير جديد"}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Reports.student") || "الطالب"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">{t("Reports.selectStudent") || "اختر طالباً"}</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} {student.student_id ? `(${student.student_id})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Reports.type") || "نوع التقرير"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="report_type"
                      value={formData.report_type}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="academic">{t("Reports.types.academic") || "أكاديمي"}</option>
                      <option value="clinical">{t("Reports.types.clinical") || "سريري"}</option>
                      <option value="progress">{t("Reports.types.progress") || "تقدم"}</option>
                      <option value="summary">{t("Reports.types.summary") || "ملخص"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Reports.title") || "العنوان"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Reports.description") || "الوصف"}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("Reports.fileUrl") || "رابط الملف (URL)"}
                    </label>
                    <input
                      type="url"
                      name="file_url"
                      value={formData.file_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-4 h-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                    />
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("Reports.active") || "نشط"}
                    </label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                    >
                      {t("Reports.cancel") || "إلغاء"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitLoading && <Loader2 size={16} className="animate-spin" />}
                      {t("Reports.save") || "حفظ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Details Modal */}
          {showDetails && selectedReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("Reports.viewDetails") || "تفاصيل التقرير"}
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
                        <FileText className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Reports.title") || "العنوان"}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedReport.title || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Reports.type") || "النوع"}</p>
                          <div className="mt-1">{getReportTypeBadge(selectedReport.report_type)}</div>
                        </div>
                      </div>
                      {selectedReport.student_name && (
                        <div className="flex items-start gap-3">
                          <User className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t("Reports.student") || "الطالب"}</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{selectedReport.student_name}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <Calendar className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Reports.date") || "التاريخ"}</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{formatDate(selectedReport.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Reports.status") || "الحالة"}</p>
                          <span className={`px-2 py-1 rounded text-xs ${selectedReport.is_active ? "bg-green-500" : "bg-gray-500"} text-white`}>
                            {selectedReport.is_active ? (t("Reports.active") || "نشط") : (t("Reports.inactive") || "غير نشط")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedReport.description && (
                      <div className="flex items-start gap-3">
                        <FileText className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t("Reports.description") || "الوصف"}</p>
                          <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">{selectedReport.description}</p>
                        </div>
                      </div>
                    )}
                    {selectedReport.file_url && (
                      <div className="flex items-start gap-3">
                        <Download className="text-sky-600 dark:text-sky-400 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t("Reports.fileUrl") || "رابط الملف"}</p>
                          <a
                            href={selectedReport.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 break-all"
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


