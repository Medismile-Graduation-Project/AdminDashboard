"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, FileText, Download, Send, AlertCircle, Edit2, X, FileSpreadsheet } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import { useRtl } from "@/hooks/useRtl";
import toast from "react-hot-toast";
import {
  fetchReportByIdAsync,
  updateReportAsync,
  submitReportAsync,
  exportReportAsync,
  clearError,
  clearSelectedReport,
} from "@/redux/features/reports/reportsSlice";
import apiClient from "@/services/api";

function ReportDetailsInner() {
  const { id } = useParams();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();

  const reportsState = useSelector((state) => state.reports);
  const report = reportsState?.selectedReport || null;
  const loading = reportsState?.loading || false;
  const loadingSelected = reportsState?.loadingSelected || false;
  const error = reportsState?.error || null;

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportUrl, setExportUrl] = useState(null);

  // جلب معلومات المستخدم
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // جلب تفاصيل التقرير عند فتح الصفحة
  useEffect(() => {
    if (id) {
      dispatch(fetchReportByIdAsync(id));
    }
    // تنظيف التقرير المحدد عند الخروج
    return () => {
      dispatch(clearSelectedReport());
    };
  }, [dispatch, id]);

  // عرض رسائل الخطأ إن وجدت
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async () => {
    if (!id) return;
    
    const confirmed = window.confirm(
      "هل أنت متأكد من تقديم هذا التقرير؟ لن يمكن تعديله بعد التقديم."
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await dispatch(submitReportAsync(id)).unwrap();
      toast.success("تم تقديم التقرير بنجاح");
      // إعادة جلب التقرير المحدث
      dispatch(fetchReportByIdAsync(id));
    } catch (err) {
      toast.error(err?.message || "فشل في تقديم التقرير");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async (format = "pdf") => {
    if (!id) return;

    try {
      if (format === "pdf") {
        setExporting(true);
      } else {
        setExportingExcel(true);
      }

      // استدعاء API التصدير للحصول على file_url
      const result = await dispatch(exportReportAsync({ id, format })).unwrap();
      
      // الحصول على file_url من الاستجابة
      let fileUrl = result?.file_url || result?.data?.file_url;
      
      if (!fileUrl) {
        console.error("Export result:", result); // للتصحيح
        toast.error("لم يتم الحصول على رابط الملف من الـ API");
        return;
      }

      console.log("File URL from API:", fileUrl); // للتصحيح

      // بناء URL كامل للملف
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://medismile1-production.up.railway.app/api";
      let fullFileUrl = fileUrl;
      
      if (fileUrl.startsWith("/")) {
        // إذا كان المسار نسبي، نضيف base URL (بدون /api/)
        const baseUrl = apiBaseUrl.replace(/\/api$/, "");
        fullFileUrl = `${baseUrl}${fileUrl}`;
      }

      console.log("Full file URL:", fullFileUrl); // للتصحيح

      // جلب الملف الفعلي من الرابط
      const accessToken = localStorage.getItem("access_token");
      const fileResponse = await fetch(fullFileUrl, {
        method: "GET",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!fileResponse.ok) {
        console.error("File response status:", fileResponse.status, fileResponse.statusText);
        throw new Error(`فشل في تحميل الملف: ${fileResponse.status}`);
      }

      // التحقق من نوع المحتوى
      const contentType = fileResponse.headers.get("content-type");
      console.log("Content-Type:", contentType); // للتصحيح

      // إذا كان المحتوى JSON، فهناك مشكلة
      if (contentType && contentType.includes("application/json")) {
        const jsonData = await fileResponse.json();
        console.error("Received JSON instead of file:", jsonData);
        throw new Error("الخادم أعاد JSON بدلاً من الملف. يرجى التحقق من رابط الملف.");
      }

      // تحويل الاستجابة إلى blob (ملف)
      const blob = await fileResponse.blob();
      console.log("Blob type:", blob.type, "Size:", blob.size); // للتصحيح

      // إنشاء رابط تحميل
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      
      // اسم الملف مع الامتداد الصحيح
      const fileExtension = format === "pdf" ? "pdf" : "xlsx";
      const fileName = `تقرير_${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      link.download = fileName;
      
      // تحميل الملف
      document.body.appendChild(link);
      link.click();
      
      // تنظيف
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      toast.success("تم تحميل الملف بنجاح");
    } catch (err) {
      console.error("Export error:", err);
      const errorMessage = err?.message || err || `فشل في تصدير التقرير إلى ${format === "pdf" ? "PDF" : "Excel"}`;
      toast.error(errorMessage);
    } finally {
      setExporting(false);
      setExportingExcel(false);
    }
  };

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900" />
    );
  }

  const directionRtl = isRtl || i18n?.language === "ar";

  if (loadingSelected && !report) {
    return (
      <AnimatedWrapper>
        <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${directionRtl ? "text-right" : "text-left"}`}>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-sky-500" size={32} />
          </div>
        </div>
      </AnimatedWrapper>
    );
  }

  if (error && !report) {
    return (
      <AnimatedWrapper>
        <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${directionRtl ? "text-right" : "text-left"}`}>
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4 text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/reports")}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </AnimatedWrapper>
    );
  }

  if (!report) {
    return (
      <AnimatedWrapper>
        <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${directionRtl ? "text-right" : "text-left"}`}>
          <p className="text-slate-500 dark:text-slate-400">التقرير غير موجود</p>
          <button
            onClick={() => router.push("/reports")}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </AnimatedWrapper>
    );
  }

  const canSubmit = (user?.role === "university_admin" || user?.role === "supervisor" || user?.role === "student") && 
                    report.status === "draft";
  const canExport = user?.role === "university_admin";
  const canUpdate = (user?.role === "university_admin" || user?.role === "supervisor" || user?.role === "student") && 
                    (report.status === "draft" || report.status === "rejected");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <AnimatedWrapper>
      <div
        className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
          directionRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
            <button
              type="button"
              onClick={() => router.push("/reports")}
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>العودة إلى التقارير</span>
            </button>
          </div>

          {/* Content Card */}
          <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 text-slate-900 dark:text-white">
                    {report.title || "بدون عنوان"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {report.student_name && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        الطالب: {report.student_name}
                      </span>
                    )}
                    {report.report_type && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-medium">
                        {report.report_type}
                      </span>
                    )}
                  </div>
                </div>
                {/* Status Badge */}
                {report.status && (
                  <span
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                      report.status === "draft" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      report.status === "submitted" ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" :
                      report.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      report.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                      report.status === "locked" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {report.status === "draft" ? "مسودة" :
                     report.status === "submitted" ? "مقدمة" :
                     report.status === "approved" ? "موافق عليها" :
                     report.status === "rejected" ? "مرفوضة" :
                     report.status === "locked" ? "مقفلة" :
                     report.status}
                  </span>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Description */}
              {report.description && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    الوصف
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>
              )}

              {/* Content (JSON) */}
              {report.content && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    المحتوى
                  </h3>
                  <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(report.content, null, 2)}
                  </pre>
                </div>
              )}

              {/* Target Info */}
              {report.target_type && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    الهدف
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {report.target_type === "case" ? "حالة سريرية" : 
                     report.target_type === "appointment" ? "موعد" : 
                     report.target_type === "session" ? "جلسة" : 
                     report.target_type}
                  </p>
                </div>
              )}

              {/* Author Info */}
              {report.author_name && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    المؤلف
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {report.author_name}
                    {report.author_role && (
                      <span className="text-sm text-slate-500 dark:text-slate-400 mr-2">
                        ({report.author_role === "student" ? "طالب" : 
                          report.author_role === "supervisor" ? "مشرف" : 
                          report.author_role === "university_admin" ? "مسؤول جامعة" : 
                          report.author_role})
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Supervisor Info */}
              {report.supervisor_name && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    المشرف
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {report.supervisor_name}
                  </p>
                </div>
              )}

              {/* University Info */}
              {report.university_name && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    الجامعة
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {report.university_name}
                  </p>
                </div>
              )}

              {/* Score */}
              {report.score !== null && report.score !== undefined && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    النتيجة
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {report.score}/100
                  </p>
                </div>
              )}

              {/* Feedback */}
              {report.feedback && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    الملاحظات
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white whitespace-pre-wrap">
                    {report.feedback}
                  </p>
                </div>
              )}

              {/* Review Info */}
              {report.approved_by_name && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    الموافق عليه
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {report.approved_by_name}
                  </p>
                  {report.approved_at && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      تاريخ الموافقة: {formatDate(report.approved_at)}
                    </p>
                  )}
                </div>
              )}

              {/* Review Notes */}
              {report.review_notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    ملاحظات المراجعة
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white whitespace-pre-wrap">
                    {report.review_notes}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.created_at && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      تاريخ الإنشاء
                    </h3>
                    <p className="text-base text-slate-900 dark:text-white">
                      {formatDate(report.created_at)}
                    </p>
                  </div>
                )}
                {report.submitted_at && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      تاريخ التقديم
                    </h3>
                    <p className="text-base text-slate-900 dark:text-white">
                      {formatDate(report.submitted_at)}
                    </p>
                  </div>
                )}
                {report.approved_at && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      تاريخ الموافقة
                    </h3>
                    <p className="text-base text-slate-900 dark:text-white">
                      {formatDate(report.approved_at)}
                    </p>
                  </div>
                )}
                {report.locked_at && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      تاريخ القفل
                    </h3>
                    <p className="text-base text-slate-900 dark:text-white">
                      {formatDate(report.locked_at)}
                    </p>
                  </div>
                )}
                {report.rejected_at && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      تاريخ الرفض
                    </h3>
                    <p className="text-base text-slate-900 dark:text-white">
                      {formatDate(report.rejected_at)}
                    </p>
                  </div>
                )}
                {report.updated_at && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      آخر تحديث
                    </h3>
                    <p className="text-base text-slate-900 dark:text-white">
                      {formatDate(report.updated_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {report.attachments && report.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    المرفقات
                  </h3>
                  <div className="space-y-2">
                    {report.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                      >
                        {attachment.type || `مرفق ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}


              {/* Actions */}
              {(canSubmit || canExport) && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className={`flex flex-wrap gap-3 ${directionRtl ? "flex-row-reverse" : ""}`}>
                    {canSubmit && (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || exporting || exportingExcel}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>جاري التقديم...</span>
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            <span>تقديم التقرير</span>
                          </>
                        )}
                      </button>
                    )}
                    {canExport && (
                      <>
                        <button
                          onClick={() => handleExport("pdf")}
                          disabled={submitting || exporting || exportingExcel}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {exporting ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              <span>جاري التصدير...</span>
                            </>
                          ) : (
                            <>
                              <Download size={18} />
                              <span>تصدير PDF</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleExport("excel")}
                          disabled={submitting || exporting || exportingExcel}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {exportingExcel ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              <span>جاري التصدير...</span>
                            </>
                          ) : (
                            <>
                              <FileSpreadsheet size={18} />
                              <span>تصدير Excel</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default function ReportDetailsPage() {
  return (
    <RoleGuard>
      <ReportDetailsInner />
    </RoleGuard>
  );
}

