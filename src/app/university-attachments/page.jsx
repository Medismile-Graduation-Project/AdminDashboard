"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Eye, X, FileText, Image, Video, File, Download, Calendar, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRtl } from "@/hooks/useRtl";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fetchAttachmentsAsync, fetchAttachmentByIdAsync, clearSelectedAttachment } from "../../redux/features/attachments/attachmentsSlice";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";
import Link from "next/link";

export default function UniversityAttachmentsPage() {
  return (
    <RoleGuard allowedRoles={["university_admin"]}>
      <UniversityAttachmentsContent />
    </RoleGuard>
  );
}

function UniversityAttachmentsContent() {
  const { t, i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();
  const { attachments, selectedAttachment, loading, loadingSelected, error } = useSelector((state) => state.attachments);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // State للفلترة والبحث
  const [searchTerm, setSearchTerm] = useState("");
  const [fileCategoryFilter, setFileCategoryFilter] = useState("all");
  const [attachmentTypeFilter, setAttachmentTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [showDetails, setShowDetails] = useState(null);

  // جلب المرفقات عند تحميل الصفحة
  useEffect(() => {
    const params = {};
    if (fileCategoryFilter !== "all") {
      params.file_category = fileCategoryFilter;
    }
    if (attachmentTypeFilter !== "all") {
      params.attachment_type = attachmentTypeFilter;
    }
    dispatch(fetchAttachmentsAsync(params));
  }, [dispatch, fileCategoryFilter, attachmentTypeFilter]);

  // معالجة عرض التفاصيل
  const handleViewDetails = async (attachmentId) => {
    try {
      await dispatch(fetchAttachmentByIdAsync(attachmentId)).unwrap();
      setShowDetails(attachmentId);
    } catch (error) {
      toast.error(error || "فشل في جلب تفاصيل المرفق");
    }
  };

  // إغلاق تفاصيل المرفق
  const handleCloseDetails = () => {
    setShowDetails(null);
    dispatch(clearSelectedAttachment());
  };

  // Helper function للحصول على أيقونة نوع الملف
  const getFileIcon = (fileCategory, mimeType) => {
    if (fileCategory === "image" || mimeType?.startsWith("image/")) {
      return <Image className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    }
    if (fileCategory === "video" || mimeType?.startsWith("video/")) {
      return <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
    return <File className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
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
      <span className={`px-2 py-1 rounded text-xs font-semibold ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  // فلترة المرفقات
  const filteredAttachments = attachments.filter((att) => {
    // فلترة البحث
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (att.original_filename || "").toLowerCase().includes(searchLower) ||
      (att.case_title || "").toLowerCase().includes(searchLower) ||
      (att.uploaded_by_name || "").toLowerCase().includes(searchLower);

    // فلترة التاريخ
    let matchesDate = true;
    if (att.created_at) {
      const attDate = new Date(att.created_at);
      if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter);
        fromDate.setHours(0, 0, 0, 0);
        if (attDate < fromDate) matchesDate = false;
      }
      if (dateToFilter) {
        const toDate = new Date(dateToFilter);
        toDate.setHours(23, 59, 59, 999);
        if (attDate > toDate) matchesDate = false;
      }
    } else if (dateFromFilter || dateToFilter) {
      matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900"></div>
    );
  }

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
                المرفقات
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                {filteredAttachments.length} مرفق
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-dark-light rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className={`flex flex-wrap gap-4 items-end ${isRtl ? "flex-row-reverse" : ""}`}>
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  بحث
                </label>
                <div className="relative">
                  <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} size={18} />
                  <input
                    type="text"
                    placeholder="ابحث عن مرفق..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200`}
                  />
                </div>
              </div>

              {/* File Category Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  نوع الملف
                </label>
                <select
                  value={fileCategoryFilter}
                  onChange={(e) => setFileCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">الكل</option>
                  <option value="image">صورة</option>
                  <option value="document">وثيقة</option>
                  <option value="video">فيديو</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              {/* Attachment Type Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  نوع المرفق
                </label>
                <select
                  value={attachmentTypeFilter}
                  onChange={(e) => setAttachmentTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                >
                  <option value="all">الكل</option>
                  <option value="before_image">صورة قبل</option>
                  <option value="after_image">صورة بعد</option>
                  <option value="report">تقرير</option>
                  <option value="other">أخرى</option>
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

              {/* Reset Filters */}
              <div>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFileCategoryFilter("all");
                    setAttachmentTypeFilter("all");
                    setDateFromFilter("");
                    setDateToFilter("");
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
          {loading && attachments.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={32} />
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
              <table
                className={`w-full text-sm text-slate-900 dark:text-slate-200 min-w-[1000px] ${
                  isRtl ? "text-right" : "text-left"
                }`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                <thead className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 dark:from-dark-lighter dark:via-dark-light dark:to-dark-lighter text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">الملف</th>
                    <th className="px-6 py-4 font-semibold">النوع</th>
                    <th className="px-6 py-4 font-semibold">الحجم</th>
                    <th className="px-6 py-4 font-semibold">الحالة المرتبطة</th>
                    <th className="px-6 py-4 font-semibold">الطالب</th>
                    <th className="px-6 py-4 font-semibold">التاريخ</th>
                    <th className="px-6 py-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttachments && filteredAttachments.length > 0 ? (
                    filteredAttachments.map((att, idx) => (
                      <motion.tr
                        key={att.id}
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
                          <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                            {getFileIcon(att.file_category, att.mime_type)}
                            <span>{att.original_filename || "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getAttachmentTypeBadge(att.attachment_type)}</td>
                        <td className="px-6 py-4">{att.file_size_formatted || "-"}</td>
                        <td className="px-6 py-4">
                          {att.case_title ? (
                            <Link 
                              href={`/university-cases/${att.case_id}`}
                              className="text-sky-700 dark:text-sky-300 hover:underline font-medium"
                            >
                              {att.case_title}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4">{att.uploaded_by_name || "-"}</td>
                        <td className="px-6 py-4">
                          {att.created_at
                            ? new Date(att.created_at).toLocaleDateString("ar-SA", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 ${isRtl ? "justify-start" : "justify-end"}`}>
                            <Link
                              href={`/university-attachments/${att.id}`}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
                            >
                              <Eye size={16} />
                              <span>عرض</span>
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-12 text-slate-500 dark:text-slate-400"
                      >
                        لا توجد مرفقات
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
              {filteredAttachments && filteredAttachments.length > 0 ? (
                filteredAttachments.map((att) => (
                  <motion.div
                    key={att.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-light rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {getFileIcon(att.file_category, att.mime_type)}
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {att.original_filename || "-"}
                      </h3>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">النوع:</span> {getAttachmentTypeBadge(att.attachment_type)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">الحجم:</span> {att.file_size_formatted || "-"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">الحالة:</span> {att.case_title || "-"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">الطالب:</span> {att.uploaded_by_name || "-"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">التاريخ:</span>{" "}
                        {att.created_at
                          ? new Date(att.created_at).toLocaleDateString("ar-SA")
                          : "-"}
                      </p>
                    </div>
                    <Link
                      href={`/university-attachments/${att.id}`}
                      className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm hover:shadow-md"
                    >
                      <Eye size={16} />
                      <span>عرض التفاصيل</span>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-12 text-slate-500 dark:text-slate-400">
                  لا توجد مرفقات
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

