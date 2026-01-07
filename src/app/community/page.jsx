"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import { useRtl } from "@/hooks/useRtl";
import toast from "react-hot-toast";
import {
  fetchCommunityContentAsync,
  clearError as clearMediContentError,
} from "@/redux/features/mediContent/mediContentSlice";

function CommunityContentPageInner() {
  const { i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();

  const { content, loading, error } = useSelector((state) => state.mediContent);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // جلب محتوى المجتمع الخاص بالجامعة عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchCommunityContentAsync({}));
  }, [dispatch]);

  // عرض رسائل الخطأ إن وجدت
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMediContentError());
    }
  }, [error, dispatch]);

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 min-height-screen bg-sky-50 dark:bg-slate-900" />
    );
  }

  const directionRtl = isRtl || i18n?.language === "ar";

  return (
    <AnimatedWrapper>
      <div
        className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
          directionRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
              محتوى المجتمع الجامعي
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              عرض جميع منشورات المجتمع الخاصة بجامعتك (قراءة فقط لمسؤول
              الجامعة)
            </p>
          </div>

          {/* Loading */}
          {loading && content.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-sky-600" size={32} />
            </div>
          )}

          {/* Table (Desktop) */}
          {!loading && (
            <div className="hidden sm:block overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
              <table
                className={`w-full text-sm text-slate-900 dark:text-slate-200 min-w-[900px] ${
                  directionRtl ? "text-right" : "text-left"
                }`}
                dir={directionRtl ? "rtl" : "ltr"}
              >
                <thead className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 dark:from-dark-lighter dark:via-dark-light dark:to-dark-lighter text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">العنوان</th>
                    <th className="px-6 py-4 font-semibold">الكاتب</th>
                    <th className="px-6 py-4 font-semibold">النوع</th>
                    <th className="px-6 py-4 font-semibold">الحالة</th>
                    <th className="px-6 py-4 font-semibold">الإعجابات</th>
                    <th className="px-6 py-4 font-semibold">التعليقات</th>
                    <th className="px-6 py-4 font-semibold">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {content && content.length > 0 ? (
                    content.map((item) => (
                      <tr
                        key={item.id}
                        className="bg-white dark:bg-dark-light border-b border-sky-100/60 dark:border-dark-lighter hover:bg-sky-50/60 dark:hover:bg-dark-lighter transition-colors"
                      >
                        <td className="px-6 py-4 font-medium">
                          {item.status === "approved" ? (
                            <Link
                              href={`/community/${item.id}`}
                              className="text-sky-700 dark:text-sky-300 hover:underline"
                            >
                              {item.title || "-"}
                            </Link>
                          ) : (
                            <span>{item.title || "-"}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.author_name || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {item.content_type || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                            {item.status || "غير محدد"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.likes_count ?? 0}
                        </td>
                        <td className="px-6 py-4">
                          {item.comments_count ?? 0}
                        </td>
                        <td className="px-6 py-4">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(
                                "ar-SA",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        لا يوجد محتوى مجتمع حتى الآن
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards (Mobile) */}
          {!loading && (
            <div className="sm:hidden grid gap-4 mt-4">
              {content && content.length > 0 ? (
                content.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-5 border-2 border-sky-200/50 dark:border-dark-lighter"
                  >
                    <h3 className="font-bold text-lg mb-2">
                      {item.status === "approved" ? (
                        <Link
                          href={`/community/${item.id}`}
                          className="text-sky-700 dark:text-sky-300 hover:underline"
                        >
                          {item.title || "-"}
                        </Link>
                      ) : (
                        <span>{item.title || "-"}</span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      الكاتب: {item.author_name || "-"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      النوع: {item.content_type || "-"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      الحالة: {item.status || "غير محدد"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span>❤️ {item.likes_count ?? 0}</span>
                      <span>💬 {item.comments_count ?? 0}</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString(
                            "ar-SA",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-500 dark:text-slate-400">
                  لا يوجد محتوى مجتمع حتى الآن
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default function CommunityContentPage() {
  return (
    <RoleGuard>
      <CommunityContentPageInner />
    </RoleGuard>
  );
}
