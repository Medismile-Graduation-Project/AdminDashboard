"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import { useRtl } from "@/hooks/useRtl";
import toast from "react-hot-toast";
import {
  fetchApprovalsAsync,
  clearError as clearMediContentError,
} from "@/redux/features/mediContent/mediContentSlice";

function CommunityApprovalLogsInner() {
  const { i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();

  const { approvals, loadingPending, error } = useSelector(
    (state) => state.mediContent
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // جلب سجلات الموافقة والرفض عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchApprovalsAsync({}));
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
      <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900" />
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
              سجلات الموافقة على محتوى المجتمع
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              عرض تتبّع قرارات الموافقة والرفض لمنشورات المجتمع في جامعتك
            </p>
          </div>

          {/* Loading */}
          {loadingPending && approvals.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-sky-600" size={32} />
            </div>
          )}

          {/* Table (Desktop) */}
          {!loadingPending && (
            <div className="hidden sm:block overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
              <table
                className={`w-full text-sm text-slate-900 dark:text-slate-200 min-w-[900px] ${
                  directionRtl ? "text-right" : "text-left"
                }`}
                dir={directionRtl ? "rtl" : "ltr"}
              >
                <thead className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 dark:from-dark-lighter dark:via-dark-light dark:to-dark-lighter text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">الطالب</th>
                    <th className="px-6 py-4 font-semibold">المشرف</th>
                    <th className="px-6 py-4 font-semibold">القرار</th>
                    <th className="px-6 py-4 font-semibold">السبب</th>
                    <th className="px-6 py-4 font-semibold">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals && approvals.length > 0 ? (
                    approvals.map((log) => (
                      <tr
                        key={log.id}
                        className="bg-white dark:bg-dark-light border-b border-sky-100/60 dark:border-dark-lighter hover:bg-sky-50/60 dark:hover:bg-dark-lighter transition-colors"
                      >
                        <td className="px-6 py-4">
                          {log.author_name || log.author_id || log.student_id || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {log.approving_supervisor_name ||
                            log.approving_supervisor_id ||
                            log.supervisor_id ||
                            "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              log.decision === "approved"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : log.decision === "rejected"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {log.decision === "approved"
                              ? "موافق عليه"
                              : log.decision === "rejected"
                              ? "مرفوض"
                              : log.decision || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {log.reason || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString("ar-SA")
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        لا توجد سجلات موافقة حتى الآن
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards (Mobile) */}
          {!loadingPending && (
            <div className="sm:hidden grid gap-4 mt-4">
              {approvals && approvals.length > 0 ? (
                approvals.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-5 border-2 border-sky-200/50 dark:border-dark-lighter"
                  >
                    <h3 className="font-bold text-base mb-2">
                      {log.author_name || log.author_id || log.student_id || "-"}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      المشرف:{" "}
                      {log.approving_supervisor_name ||
                        log.approving_supervisor_id ||
                        log.supervisor_id ||
                        "-"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      القرار:{" "}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          log.decision === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : log.decision === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {log.decision === "approved"
                          ? "موافق عليه"
                          : log.decision === "rejected"
                          ? "مرفوض"
                          : log.decision || "-"}
                      </span>
                    </p>
                    {log.reason && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        السبب: {log.reason}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("ar-SA")
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-500 dark:text-slate-400">
                  لا توجد سجلات موافقة حتى الآن
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default function CommunityApprovalLogsPage() {
  return (
    <RoleGuard>
      <CommunityApprovalLogsInner />
    </RoleGuard>
  );
}
