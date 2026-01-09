"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, FileText, Download, Image, Video, File, Calendar, User, Eye, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import { useRtl } from "@/hooks/useRtl";
import toast from "react-hot-toast";
import {
  fetchAttachmentByIdAsync,
  clearError,
  clearSelectedAttachment,
} from "@/redux/features/attachments/attachmentsSlice";
import Link from "next/link";

function AttachmentDetailsInner() {
  const { id } = useParams();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();

  const attachmentsState = useSelector((state) => state.attachments);
  const attachment = attachmentsState?.selectedAttachment || null;
  const loading = attachmentsState?.loadingSelected || false;
  const error = attachmentsState?.error || null;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // جلب تفاصيل المرفق عند فتح الصفحة
  useEffect(() => {
    if (id) {
      dispatch(fetchAttachmentByIdAsync(id));
    }
    // تنظيف المرفق المحدد عند الخروج
    return () => {
      dispatch(clearSelectedAttachment());
    };
  }, [dispatch, id]);

  // عرض رسائل الخطأ إن وجدت
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Helper function للحصول على أيقونة نوع الملف
  const getFileIcon = (fileCategory, mimeType) => {
    if (fileCategory === "image" || mimeType?.startsWith("image/")) {
      return <Image className="w-8 h-8 text-sky-600 dark:text-sky-400" />;
    }
    if (fileCategory === "video" || mimeType?.startsWith("video/")) {
      return <Video className="w-8 h-8 text-purple-600 dark:text-purple-400" />;
    }
    return <File className="w-8 h-8 text-slate-600 dark:text-slate-400" />;
  };

  // Helper function لتنسيق نوع المرفق
  const getAttachmentTypeBadge = (type) => {
    const typeMap = {
      before_image: { label: "صورة قبل", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      after_image: { label: "صورة بعد", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      report: { label: "تقرير", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      other: { label: "أخرى", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" },
    };
    const typeInfo = typeMap[type] || { label: type, color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  // Helper function لتنسيق نوع الملف
  const getFileCategoryBadge = (category) => {
    const categoryMap = {
      image: { label: "صورة", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" },
      document: { label: "وثيقة", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" },
      video: { label: "فيديو", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
      other: { label: "أخرى", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" },
    };
    const categoryInfo = categoryMap[category] || { label: category, color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${categoryInfo.color}`}>
        {categoryInfo.label}
      </span>
    );
  };

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900" />
    );
  }

  const directionRtl = isRtl || i18n?.language === "ar";

  if (loading && !attachment) {
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

  if (error && !attachment) {
    return (
      <AnimatedWrapper>
        <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${directionRtl ? "text-right" : "text-left"}`}>
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4 text-red-700 dark:text-red-400">
            <span>{error}</span>
          </div>
          <button
            onClick={() => router.push("/university-attachments")}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </AnimatedWrapper>
    );
  }

  if (!attachment) {
    return (
      <AnimatedWrapper>
        <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${directionRtl ? "text-right" : "text-left"}`}>
          <p className="text-slate-500 dark:text-slate-400">المرفق غير موجود</p>
          <button
            onClick={() => router.push("/university-attachments")}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </AnimatedWrapper>
    );
  }

  const isImage = attachment.file_category === "image" || attachment.mime_type?.startsWith("image/");

  return (
    <AnimatedWrapper>
      <div
        className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
          directionRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push("/university-attachments")}
            className={`inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 transition-colors mb-6 ${directionRtl ? "flex-row-reverse" : ""}`}
          >
            <ArrowLeft size={18} />
            <span>العودة إلى المرفقات</span>
          </button>

          {/* Content Card */}
          <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getFileIcon(attachment.file_category, attachment.mime_type)}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {attachment.original_filename || "مرفق بدون اسم"}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {getAttachmentTypeBadge(attachment.attachment_type)}
                    {getFileCategoryBadge(attachment.file_category)}
                    {attachment.is_visible_to_patient && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        مرئي للمريض
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* File Preview (for images) */}
              {isImage && attachment.file_url && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                    معاينة الصورة
                  </h3>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <img
                      src={attachment.file_url}
                      alt={attachment.original_filename || "صورة"}
                      className="w-full h-auto max-h-96 object-contain bg-slate-50 dark:bg-slate-900"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-500">
                      <p>لا يمكن عرض الصورة</p>
                    </div>
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    اسم الملف
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {attachment.original_filename || "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    حجم الملف
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {attachment.file_size_formatted || "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    نوع الملف
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {attachment.mime_type || "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    تاريخ الرفع
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {attachment.created_at
                      ? new Date(attachment.created_at).toLocaleString("ar-SA", {
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

              {/* Related Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                {attachment.case_title && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      الحالة المرتبطة
                    </h3>
                    <Link
                      href={`/university-cases/${attachment.case_id}`}
                      className="text-base text-sky-700 dark:text-sky-300 hover:underline flex items-center gap-2"
                    >
                      {attachment.case_title}
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                )}
                {attachment.uploaded_by_name && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                      <User size={16} />
                      الطالب الذي رفع الملف
                    </h3>
                    <p className="text-base text-slate-900 dark:text-white">
                      {attachment.uploaded_by_name}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {attachment.file_url && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className={`flex flex-wrap gap-3 ${directionRtl ? "flex-row-reverse" : ""}`}>
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                      <span>معاينة</span>
                    </a>
                    <a
                      href={attachment.file_url}
                      download={attachment.original_filename}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      <Download size={18} />
                      <span>تحميل</span>
                    </a>
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

export default function AttachmentDetailsPage() {
  return (
    <RoleGuard allowedRoles={["university_admin"]}>
      <AttachmentDetailsInner />
    </RoleGuard>
  );
}

