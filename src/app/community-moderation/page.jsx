"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle, XCircle, RefreshCw, Eye, X } from "lucide-react";
import { motion } from "framer-motion";
import { getUser } from "@/lib/auth";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import {
  fetchPendingContentAsync,
  approveContentAsync,
  rejectContentAsync,
  clearError,
} from "@/redux/features/mediContent/mediContentSlice";
import toast from "react-hot-toast";

function CommunityModerationContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { pendingContent, loadingPending, error } = useSelector(
    (state) => state.mediContent
  );
  const [user, setUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    
    // جلب المحتوى المعلق (backend يفترض المستخدم المسجل دخوله)
    dispatch(fetchPendingContentAsync());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPendingContentAsync());
  };

  const handleApprove = async (contentId) => {
    if (!user?.id) return;
    
    setProcessingId(contentId);
    try {
      await dispatch(
        approveContentAsync({ contentId, userId: user.id })
      ).unwrap();
      toast.success("تم الموافقة على المحتوى بنجاح");
      // إعادة جلب المحتوى المعلق
      dispatch(fetchPendingContentAsync());
    } catch (error) {
      toast.error(error || "فشل في الموافقة على المحتوى");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (content) => {
    setSelectedContent(content);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedContent || !user?.id) return;

    setProcessingId(selectedContent.id);
    try {
      await dispatch(
        rejectContentAsync({
          contentId: selectedContent.id,
          userId: user.id,
          rejectionReason: rejectionReason || null,
        })
      ).unwrap();
      toast.success("تم رفض المحتوى بنجاح");
      setShowRejectModal(false);
      setSelectedContent(null);
      setRejectionReason("");
      // إعادة جلب المحتوى المعلق
      dispatch(fetchPendingContentAsync());
    } catch (error) {
      toast.error(error || "فشل في رفض المحتوى");
    } finally {
      setProcessingId(null);
    }
  };

  const isRtl = i18n.language === "ar";

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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-700 to-purple-500 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
              {t("moderation.title") || "إشراف المحتوى المجتمعي"}
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loadingPending}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 
                hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 
                text-white transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
            >
              <RefreshCw size={18} className={loadingPending ? "animate-spin" : ""} />
              <span>{t("actions.refresh") || "تحديث"}</span>
            </motion.button>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-dark-light border-2 border-purple-200/50 dark:border-dark-lighter shadow-lg rounded-2xl p-4 sm:p-5 text-center hover:shadow-xl transition-all duration-300"
            >
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
                {pendingContent.length}
              </p>
              <p className="text-sm sm:text-base text-purple-700 dark:text-purple-300 mt-1">
                {t("moderation.pending") || "محتوى معلق"}
              </p>
            </motion.div>
          </div>

          {/* Loading State */}
          {loadingPending && pendingContent.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
          )}

          {/* قائمة المحتوى المعلق */}
          {!loadingPending && (
            <div className="space-y-4">
              {pendingContent.length > 0 ? (
                pendingContent.map((content, idx) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white dark:bg-dark-light border-2 border-purple-200/50 dark:border-dark-lighter shadow-lg rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      {/* معلومات المحتوى */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h2 className="font-semibold text-lg sm:text-xl text-slate-900 dark:text-white">
                            {content.title || t("moderation.untitled") || "بدون عنوان"}
                          </h2>
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                            {t("moderation.pending") || "معلق"}
                          </span>
                        </div>

                        {content.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
                            {content.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          {content.author && (
                            <div>
                              <span className="font-medium">
                                {t("moderation.author") || "المؤلف"}:
                              </span>{" "}
                              {content.author.first_name && content.author.last_name
                                ? `${content.author.first_name} ${content.author.last_name}`
                                : content.author.username || "-"}
                            </div>
                          )}
                          {content.created_at && (
                            <div>
                              <span className="font-medium">
                                {t("moderation.createdAt") || "تاريخ الإنشاء"}:
                              </span>{" "}
                              {new Date(content.created_at).toLocaleDateString(
                                "ar-SA",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          )}
                          {content.type && (
                            <div>
                              <span className="font-medium">
                                {t("moderation.type") || "النوع"}:
                              </span>{" "}
                              {content.type}
                            </div>
                          )}
                          {content.category && (
                            <div>
                              <span className="font-medium">
                                {t("moderation.category") || "الفئة"}:
                              </span>{" "}
                              {content.category}
                            </div>
                          )}
                        </div>

                        {/* عرض الملف إذا كان موجود */}
                        {content.file_url && (
                          <div className="mt-3">
                            <a
                              href={content.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              <Eye size={16} />
                              {t("moderation.viewFile") || "عرض الملف"}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(content.id)}
                          disabled={processingId === content.id}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 
                            hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 
                            text-white transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
                        >
                          {processingId === content.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                          <span>{t("moderation.approve") || "موافقة"}</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRejectClick(content)}
                          disabled={processingId === content.id}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 
                            hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 
                            text-white transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
                        >
                          <XCircle size={18} />
                          <span>{t("moderation.reject") || "رفض"}</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 rounded-2xl bg-purple-50/50 dark:bg-dark-light/30 border-2 border-purple-200/50 dark:border-dark-lighter">
                  <p className="text-purple-600 dark:text-purple-400 text-lg font-semibold">
                    {t("moderation.noPendingContent") ||
                      "لا يوجد محتوى معلق"}
                  </p>
                  <p className="text-purple-500 dark:text-purple-500 text-sm mt-2">
                    {t("moderation.noPendingContentDescription") ||
                      "جميع المحتويات تمت مراجعتها."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Modal لرفض المحتوى */}
          {showRejectModal && selectedContent && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-purple-200 dark:border-slate-700">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-red-600 to-red-700 dark:from-slate-700 dark:to-slate-800 text-white">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {t("moderation.rejectContent") || "رفض المحتوى"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedContent(null);
                      setRejectionReason("");
                    }}
                    disabled={processingId === selectedContent.id}
                    className="p-1 rounded-full hover:bg-red-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-white transition-colors disabled:opacity-50"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      {t("moderation.rejectionReason") || "سبب الرفض"} (اختياري)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="4"
                      placeholder={t("moderation.rejectionReasonPlaceholder") || "أدخل سبب الرفض..."}
                      className="w-full p-2 sm:p-3 border border-red-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                      disabled={processingId === selectedContent.id}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectModal(false);
                        setSelectedContent(null);
                        setRejectionReason("");
                      }}
                      disabled={processingId === selectedContent.id}
                      className="p-2 sm:p-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50"
                    >
                      {t("actions.cancel") || "إلغاء"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectSubmit}
                      disabled={processingId === selectedContent.id}
                      className="p-2 sm:p-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-xl flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 transition disabled:opacity-50"
                    >
                      {processingId === selectedContent.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
                      )}{" "}
                      {t("moderation.confirmReject") || "تأكيد الرفض"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default function CommunityModerationPage() {
  return (
    <RoleGuard allowedRoles={["university_admin"]}>
      <CommunityModerationContent />
    </RoleGuard>
  );
}

