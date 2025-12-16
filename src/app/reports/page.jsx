"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Download, FileText, RefreshCw } from "lucide-react";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import cairoFont from "@/fonts/Cairo-Regular-normal";
import {
  fetchReportsAsync,
  fetchStudentReportsAsync,
  fetchUniversityReportsAsync,
} from "@/redux/features/reports/reportsSlice";

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => setMounted(true), []);
  
  // جلب بيانات المستخدم
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  // جلب التقارير من API عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      const params = {};
      
      if (user.role === "student") {
        // الطالب يرى تقاريره فقط
        const studentId = user.id || user.user_id;
        if (studentId) {
          dispatch(fetchStudentReportsAsync(studentId));
        }
      } else if (user.role === "supervisor") {
        // المشرف يرى تقارير طلابه
        dispatch(fetchReportsAsync(params));
      } else if (user.role === "college_admin" || user.role === "university_admin" || user.role === "tech_support") {
        // الإداريون يرون جميع التقارير
        if (user.university_id || user.university) {
          const universityId = user.university_id || user.university;
          dispatch(fetchUniversityReportsAsync(universityId));
        }
        dispatch(fetchReportsAsync(params));
      } else {
        dispatch(fetchReportsAsync(params));
      }
    }
  }, [user, dispatch]);

  const isRtl = i18n.language === "ar";

  // جلب البيانات من Redux (من API فقط)
  const reports = useSelector((state) => state.reports?.reports || []);
  const loading = useSelector((state) => state.reports?.loading || false);
  const error = useSelector((state) => state.reports?.error || null);
  const studentReports = useSelector((state) => state.reports?.studentReports || {});
  const universityReports = useSelector((state) => state.reports?.universityReports || {});

  // دالة إعادة تحميل التقارير
  const handleRefresh = () => {
    if (user) {
      const params = {};
      if (user.role === "student") {
        const studentId = user.id || user.user_id;
        if (studentId) {
          dispatch(fetchStudentReportsAsync(studentId));
        }
      } else if (user.role === "supervisor") {
        dispatch(fetchReportsAsync(params));
      } else if (user.role === "college_admin" || user.role === "university_admin" || user.role === "tech_support") {
        if (user.university_id || user.university) {
          const universityId = user.university_id || user.university;
          dispatch(fetchUniversityReportsAsync(universityId));
        }
        dispatch(fetchReportsAsync(params));
      } else {
        dispatch(fetchReportsAsync(params));
      }
    }
  };

  // تحديد التقارير المعروضة حسب دور المستخدم
  const displayedReports = useMemo(() => {
    if (user?.role === "student") {
      const studentId = user.id || user.user_id;
      return studentReports[studentId] || [];
    } else if (user?.role === "college_admin" || user?.role === "university_admin" || user?.role === "tech_support") {
      const universityId = user.university_id || user.university;
      if (universityId && universityReports[universityId]) {
        return universityReports[universityId];
      }
    }
    return reports;
  }, [reports, studentReports, universityReports, user]);

  // دالة تصدير التقارير إلى Excel
  const exportReportsToExcel = () => {
    if (displayedReports.length === 0) {
      alert(t("reports.noReportsToExport") || "لا توجد تقارير للتصدير");
      return;
    }

    const reportsData = displayedReports.map((report) => ({
      [t("reports.title") || "العنوان"]: report.title || "-",
      [t("reports.description") || "الوصف"]: report.description || "-",
      [t("reports.type") || "النوع"]: report.report_type || "-",
      [t("reports.student") || "الطالب"]: report.student?.first_name && report.student?.last_name
        ? `${report.student.first_name} ${report.student.last_name}`
        : report.student?.username || "-",
      [t("reports.university") || "الجامعة"]: report.university?.name || "-",
      [t("reports.generatedAt") || "تاريخ الإنشاء"]: report.generated_at
        ? new Date(report.generated_at).toLocaleDateString("ar-SA")
        : "-",
      [t("reports.status") || "الحالة"]: report.is_active ? (t("reports.active") || "نشط") : (t("reports.inactive") || "غير نشط"),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportsData), "Reports");
    XLSX.writeFile(wb, `reports_${Date.now()}.xlsx`);
  };

  // دالة تصدير التقارير إلى PDF
  const exportReportsToPDF = () => {
    if (displayedReports.length === 0) {
      alert(t("reports.noReportsToExport") || "لا توجد تقارير للتصدير");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.addFileToVFS("Cairo-Regular-normal.ttf", cairoFont);
    doc.addFont("Cairo-Regular-normal.ttf", "Cairo", "normal");
    doc.setFont("Cairo");
    doc.setFontSize(14);

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(t("reports.mainTitle") || "التقارير", pageWidth / 2, 50, { align: "center" });

    const head = [[
      t("reports.title") || "العنوان",
      t("reports.type") || "النوع",
      t("reports.student") || "الطالب",
      t("reports.generatedAt") || "تاريخ الإنشاء"
    ]];

    const body = displayedReports.map((report) => [
      report.title || "-",
      report.report_type || "-",
      report.student?.first_name && report.student?.last_name
        ? `${report.student.first_name} ${report.student.last_name}`
        : report.student?.username || "-",
      report.generated_at
        ? new Date(report.generated_at).toLocaleDateString("ar-SA")
        : "-",
    ]);

    autoTable(doc, {
      startY: 70,
      head,
      body,
      theme: "grid",
      styles: { font: "Cairo", halign: "right", cellPadding: 5 },
      headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold", halign: "center" },
      columnStyles: head[0].reduce((acc, _, idx) => {
        acc[idx] = { halign: "right" };
        return acc;
      }, {}),
      rtl: true,
    });

    doc.save(`reports_${Date.now()}.pdf`);
  };

  if (!mounted)
    return <div className="p-6 min-h-screen bg-sky-50 dark:bg-slate-900" />;

  return (
    <AnimatedWrapper>
      <div className={`p-6 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 dark:text-white">
              {t("reports.mainTitle") || "التقارير"}
            </h1>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white transition disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {t("actions.refresh") || "تحديث"}
              </button>
              {displayedReports.length > 0 && (
                <>
                  <button
                    onClick={exportReportsToExcel}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition"
                  >
                    <Download size={16} /> Excel
                  </button>
                  <button
                    onClick={exportReportsToPDF}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition"
                  >
                    <FileText size={16} /> PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* حالة التحميل */}
          {loading && (
            <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-center">
              {t("loading") || "جاري تحميل التقارير..."}
            </div>
          )}

          {/* رسالة عدم وجود تقارير */}
          {!loading && displayedReports.length === 0 && (
            <div className="mb-4 p-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {t("reports.noReports") || "لا توجد تقارير متاحة"}
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                {t("reports.noReportsDescription") || "لم يتم العثور على أي تقارير. يرجى المحاولة لاحقاً."}
              </p>
            </div>
          )}

          {/* عرض التقارير من API */}
          {displayedReports.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow border border-sky-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-blue-900 dark:text-white flex-1">
                      {report.title || t("reports.report") || "تقرير"} #{report.id?.slice(0, 8) || "N/A"}
                    </h3>
                    {report.is_active && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {t("reports.active") || "نشط"}
                      </span>
                    )}
                  </div>
                  
                  {report.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {report.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {t("reports.type") || "النوع"}:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {report.report_type || "-"}
                      </span>
                    </div>
                    
                    {report.student && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          {t("reports.student") || "الطالب"}:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {report.student.first_name && report.student.last_name
                            ? `${report.student.first_name} ${report.student.last_name}`
                            : report.student.username || "-"}
                        </span>
                      </div>
                    )}

                    {report.university && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          {t("reports.university") || "الجامعة"}:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {report.university.name || "-"}
                        </span>
                      </div>
                    )}

                    {report.generated_at && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          {t("reports.generatedAt") || "تاريخ الإنشاء"}:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {new Date(report.generated_at).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {report.file_url && (
                    <a
                      href={report.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition"
                    >
                      <Download size={16} />
                      {t("actions.download") || "تحميل التقرير"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}
