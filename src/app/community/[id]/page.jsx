"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import { useRtl } from "@/hooks/useRtl";
import toast from "react-hot-toast";
import {
  fetchCommunityContentByIdAsync,
  deleteCommunityContentAsync,
  clearError as clearMediContentError,
  clearSelectedContent,
} from "@/redux/features/mediContent/mediContentSlice";

function CommunityContentDetailsInner() {
  const { id } = useParams();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();

  const { selectedContent, loadingSelected, loading, error } = useSelector(
    (state) => state.mediContent
  );

  const [mounted, setMounted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // جلب تفاصيل المنشور عند فتح الصفحة
  useEffect(() => {
    if (id) {
      dispatch(fetchCommunityContentByIdAsync(id));
    }
    // تنظيف المحتوى المحدد عند الخروج
    return () => {
      dispatch(clearSelectedContent());
    };
  }, [dispatch, id]);

  // عرض رسائل الخطأ إن وجدت
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMediContentError());
    }
  }, [error, dispatch]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا المحتوى من المجتمع؟"
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await dispatch(deleteCommunityContentAsync(id)).unwrap();
      toast.success("تم حذف المحتوى بنجاح");
      router.push("/community");
    } catch (err) {
      toast.error(err?.message || "فشل في حذف المحتوى");
    } finally {
      setDeleting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 min-height-screen bg-sky-50 dark:bg-slate-900" />
    );
  }

  const directionRtl = isRtl || i18n?.language === "ar";

  const content = selectedContent;

  const isLoading = loadingSelected || (!content && loading);

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
              onClick={() => router.push("/community")}
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300"
            >
              {directionRtl ? (
                <>
                  <ArrowRight size={18} />
                  <span>رجوع إلى قائمة المحتوى</span>
                </>
              ) : (
                <>
                  <span>Back to community list</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>جاري الحذف...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>حذف المحتوى</span>
                </>
              )}
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-sky-600" size={32} />
            </div>
          )}

          {/* لا يوجد محتوى */}
          {!isLoading && !content && (
            <div className="mt-8 p-6 rounded-2xl border-2 border-sky-200/60 dark:border-dark-lighter bg-white dark:bg-dark-light text-center text-slate-600 dark:text-slate-300">
              المحتوى غير موجود أو تم حذفه.
            </div>
          )}

          {/* تفاصيل المحتوى */}
          {!isLoading && content && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border-2 border-sky-200/60 dark:border-dark-lighter bg-white dark:bg-dark-light shadow-sm">
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 text-slate-900 dark:text-white">
                  {content.title || "بدون عنوان"}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  الكاتب: {content.author_name || "-"}
                </p>
                {content.university_name && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    الجامعة: {content.university_name}
                  </p>
                )}
                {content.approved_by_name && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    تمت الموافقة بواسطة: {content.approved_by_name}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  {content.content_type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      النوع: {content.content_type}
                    </span>
                  )}
                  {content.category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      الفئة: {content.category}
                    </span>
                  )}
                  {content.status && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      الحالة: {content.status}
                    </span>
                  )}
                  {typeof content.is_featured === "boolean" && content.is_featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      مميز
                    </span>
                  )}
                  {typeof content.is_public === "boolean" && content.is_public && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      مرئي للمرضى (عام)
                    </span>
                  )}
                </div>

                {/* المحتوى النصي / الوصفي */}
                {content.description && (
                  <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {content.description}
                  </p>
                )}

                {/* الوسوم */}
                {content.tags && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      الوسوم: {content.tags}
                    </p>
                  </div>
                )}

                {/* رابط خارجي إن وجد */}
                {content.url && (
                  <div className="mt-4">
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-700 dark:text-sky-300 hover:underline"
                    >
                      فتح الرابط الخارجي
                    </a>
                  </div>
                )}

                {/* ملف مرفق إن وجد */}
                {content.file_url && (
                  <div className="mt-4">
                    <a
                      href={content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-700 dark:text-sky-300 hover:underline"
                    >
                      عرض / تحميل الملف المرفق
                    </a>
                  </div>
                )}

                {/* معلومات إضافية */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {content.created_at && (
                    <span>
                      تم الإنشاء:{" "}
                      {new Date(content.created_at).toLocaleString("ar-SA")}
                    </span>
                  )}
                  {content.approved_at && (
                    <span>
                      تاريخ الموافقة:{" "}
                      {new Date(content.approved_at).toLocaleString("ar-SA")}
                    </span>
                  )}
                  {content.updated_at && (
                    <span>
                      آخر تحديث:{" "}
                      {new Date(content.updated_at).toLocaleString("ar-SA")}
                    </span>
                  )}
                  <span>الإعجابات: {content.likes_count ?? 0}</span>
                  <span>التعليقات: {content.comments_count ?? 0}</span>
                  {content.view_count !== undefined && (
                    <span>المشاهدات: {content.view_count ?? 0}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default function CommunityContentDetailsPage() {
  return (
    <RoleGuard>
      <CommunityContentDetailsInner />
    </RoleGuard>
  );
}
