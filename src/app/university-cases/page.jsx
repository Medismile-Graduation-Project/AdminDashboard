"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Filter, Search, FileSpreadsheet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fetchCases } from "../../redux/features/clinicalCases/clinicalCasesSlice";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function UniversityCasesPage() {
  return (
    <RoleGuard>
      <UniversityCasesContent />
    </RoleGuard>
  );
}

function UniversityCasesContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { cases, loading, error } = useSelector((state) => state.clinicalCases);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Filters state
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
    needsSupervisor: false, // فلتر للحالات التي تحتاج مشرف
  });

  // جلب الحالات عند تحميل الصفحة أو تغيير الفلاتر
  // الـ backend يفترض أن يفلتر حسب الجامعة تلقائياً للدور university_admin
  useEffect(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    
    dispatch(fetchCases(params));
  }, [dispatch, filters.status, filters.priority]);

  // Filter cases locally by search term and needs supervisor
  const filteredCases = cases.filter((c) => {
    // فلترة الحالات التي تحتاج مشرف
    if (filters.needsSupervisor) {
      // إذا كان هناك supervisor_id أو supervisor object، لا نعرضه
      if (c.supervisor_id || (c.supervisor && c.supervisor !== null)) {
        return false;
      }
    }
    
    // فلترة البحث
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      (c.title && c.title.toLowerCase().includes(searchTerm)) ||
      (c.patient_name && c.patient_name.toLowerCase().includes(searchTerm)) ||
      (c.student_name && c.student_name.toLowerCase().includes(searchTerm)) ||
      (c.supervisor_name && c.supervisor_name.toLowerCase().includes(searchTerm)) ||
      (c.description && c.description.toLowerCase().includes(searchTerm))
    );
  });

  // Helper function لتنسيق الحالة
  const getStatusBadge = (status) => {
    const statusMap = {
      new: { label: "جديدة", color: "bg-blue-500" },
      accepted: { label: "مقبولة", color: "bg-green-500" },
      rejected: { label: "مرفوضة", color: "bg-red-500" },
      needs_assignment_approval: { label: "تحتاج موافقة إسناد", color: "bg-yellow-500" },
      assigned: { label: "مسندة", color: "bg-purple-500" },
      in_progress: { label: "قيد التنفيذ", color: "bg-indigo-500" },
      completed: { label: "مكتملة", color: "bg-emerald-500" },
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

  // تصدير الحالات إلى Excel
  const handleExportExcel = () => {
    if (filteredCases.length === 0) {
      toast.error("لا توجد حالات للتصدير");
      return;
    }

    try {
      // تحضير البيانات للتصدير
      const excelData = filteredCases.map((caseItem) => ({
        "العنوان": caseItem.title || "-",
        "الوصف": caseItem.description || "-",
        "الحالة": 
          caseItem.status === "new" ? "جديدة" :
          caseItem.status === "accepted" ? "مقبولة" :
          caseItem.status === "rejected" ? "مرفوضة" :
          caseItem.status === "needs_assignment_approval" ? "تحتاج موافقة إسناد" :
          caseItem.status === "assigned" ? "مسندة" :
          caseItem.status === "in_progress" ? "قيد التنفيذ" :
          caseItem.status === "completed" ? "مكتملة" :
          caseItem.status === "closed" ? "مغلقة" :
          caseItem.status || "-",
        "الأولوية": 
          caseItem.priority === "low" ? "منخفضة" :
          caseItem.priority === "medium" ? "متوسطة" :
          caseItem.priority === "high" ? "عالية" :
          caseItem.priority === "urgent" ? "عاجلة" :
          caseItem.priority || "-",
        "المريض": caseItem.patient_name || "-",
        "الطالب": caseItem.student_name || "-",
        "المشرف": caseItem.supervisor_name || "-",
        "تاريخ الإنشاء": caseItem.created_at ? formatDate(caseItem.created_at) : "-",
        "تاريخ التحديث": caseItem.updated_at ? formatDate(caseItem.updated_at) : "-",
      }));

      // إنشاء workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "الحالات السريرية");

      // تحديد عرض الأعمدة
      const colWidths = [
        { wch: 30 }, // العنوان
        { wch: 40 }, // الوصف
        { wch: 20 }, // الحالة
        { wch: 15 }, // الأولوية
        { wch: 25 }, // المريض
        { wch: 25 }, // الطالب
        { wch: 25 }, // المشرف
        { wch: 20 }, // تاريخ الإنشاء
        { wch: 20 }, // تاريخ التحديث
      ];
      ws["!cols"] = colWidths;

      // تصدير الملف
      const fileName = `الحالات_السريرية_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`تم تصدير ${filteredCases.length} حالة بنجاح`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("فشل في تصدير الحالات إلى Excel");
    }
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
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
                حالات الجامعة السريرية
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {filters.needsSupervisor 
                  ? `حالات تحتاج تعيين مشرف (${filteredCases.length})`
                  : `جميع حالات جامعتك (${filteredCases.length})`}
              </p>
            </div>
            <div className="flex gap-2">
              {filteredCases.length > 0 && (
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                >
                  <FileSpreadsheet size={18} />
                  <span>تصدير Excel</span>
                </button>
              )}
              <button
                onClick={() => setFilters({ ...filters, needsSupervisor: !filters.needsSupervisor })}
                className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${
                  filters.needsSupervisor
                    ? "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white"
                    : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                }`}
              >
                {filters.needsSupervisor ? "عرض الكل" : "حالات تحتاج مشرف"}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">جميع الحالات</option>
                  <option value="new">جديدة</option>
                  <option value="accepted">مقبولة</option>
                  <option value="rejected">مرفوضة</option>
                  <option value="needs_assignment_approval">تحتاج موافقة إسناد</option>
                  <option value="assigned">مسندة</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتملة</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">جميع الأولويات</option>
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </div>

              {/* Reset Filters */}
              <div>
                <button
                  onClick={() => setFilters({ status: "", priority: "", search: "", needsSupervisor: false })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  إعادة تعيين
                </button>
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
          {loading && cases.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
              <table
                className={`w-full text-sm text-slate-900 dark:text-slate-200 min-w-[700px] ${
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
                  {filteredCases && filteredCases.length > 0 ? (
                    filteredCases.map((c, idx) => (
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
                        <td className="px-6 py-4 font-medium">
                          {(!c.supervisor_id && !c.supervisor) ? (
                            <a
                              href={`/university-cases/${c.id}`}
                              className="text-sky-700 dark:text-sky-300 hover:underline cursor-pointer"
                            >
                              {c.title || "-"}
                            </a>
                          ) : (
                            c.title || "-"
                          )}
                        </td>
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
                        {cases.length === 0
                          ? "لا توجد حالات"
                          : "لا توجد حالات تطابق البحث"}
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
              {filteredCases && filteredCases.length > 0 ? (
                filteredCases.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-5 border-2 border-sky-200/50 dark:border-dark-lighter"
                  >
                    <h3 className="font-bold text-lg mb-2">
                      {(!c.supervisor_id && !c.supervisor) ? (
                        <a
                          href={`/university-cases/${c.id}`}
                          className="text-sky-700 dark:text-sky-300 hover:underline cursor-pointer"
                        >
                          {c.title || "-"}
                        </a>
                      ) : (
                        c.title || "-"
                      )}
                    </h3>
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
                  {cases.length === 0
                    ? "لا توجد حالات"
                    : "لا توجد حالات تطابق البحث"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}





