"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Star, Edit2, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import { useRtl } from "@/hooks/useRtl";
import toast from "react-hot-toast";
import {
  fetchEvaluationByIdAsync,
  adjustEvaluationAsync,
  finalizeEvaluationAsync,
  clearError,
} from "@/redux/features/evaluations/evaluationsSlice";

function EvaluationDetailsInner() {
  const { id } = useParams();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();

  const evaluationsState = useSelector((state) => state.evaluations);
  const evaluation = evaluationsState?.selectedEvaluation || null;
  const loading = evaluationsState?.loading || false;
  const error = evaluationsState?.error || null;

  const [mounted, setMounted] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [newScore, setNewScore] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  // جلب معلومات المستخدم
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // جلب تفاصيل التقييم عند فتح الصفحة
  useEffect(() => {
    if (id) {
      dispatch(fetchEvaluationByIdAsync(id));
    }
  }, [dispatch, id]);

  // عرض رسائل الخطأ إن وجدت
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // تحديث newScore عند تحميل التقييم (عرض من 10)
  useEffect(() => {
    if (evaluation?.final_score !== undefined) {
      // تحويل من 100 إلى 10 للعرض
      setNewScore((evaluation.final_score / 10).toFixed(1));
    }
  }, [evaluation]);

  const handleAdjust = async () => {
    if (!id || !newScore) {
      toast.error("الرجاء إدخال التقييم الجديد");
      return;
    }

    const score = parseFloat(newScore);
    if (isNaN(score) || score < 0 || score > 10) {
      toast.error("التقييم يجب أن يكون بين 0 و 10");
      return;
    }

    // تحويل من 10 إلى 100 للإرسال للـ API
    const apiScore = score * 10;

    try {
      setAdjusting(true);
      await dispatch(
        adjustEvaluationAsync({
          evaluationId: id,
          adjustmentData: {
            new_score: apiScore,
            reason: adjustReason || undefined,
          },
        })
      ).unwrap();
      toast.success("تم تعديل التقييم بنجاح");
      setShowAdjustModal(false);
      setAdjustReason("");
      // إعادة جلب التقييم المحدث
      dispatch(fetchEvaluationByIdAsync(id));
    } catch (err) {
      toast.error(err?.message || "فشل في تعديل التقييم");
    } finally {
      setAdjusting(false);
    }
  };

  const handleFinalize = async () => {
    if (!id) return;
    
    const confirmed = window.confirm(
      "هل أنت متأكد من إقرار هذا التقييم؟ لن يمكن تعديله بعد الإقرار."
    );
    if (!confirmed) return;

    try {
      setFinalizing(true);
      await dispatch(finalizeEvaluationAsync(id)).unwrap();
      toast.success("تم إقرار التقييم بنجاح");
      // إعادة جلب التقييم المحدث
      dispatch(fetchEvaluationByIdAsync(id));
    } catch (err) {
      toast.error(err?.message || "فشل في إقرار التقييم");
    } finally {
      setFinalizing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900" />
    );
  }

  const directionRtl = isRtl || i18n?.language === "ar";

  if (loading && !evaluation) {
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

  if (error && !evaluation) {
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
            onClick={() => router.push("/evaluations")}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </AnimatedWrapper>
    );
  }

  if (!evaluation) {
    return (
      <AnimatedWrapper>
        <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${directionRtl ? "text-right" : "text-left"}`}>
          <p className="text-slate-500 dark:text-slate-400">التقييم غير موجود</p>
          <button
            onClick={() => router.push("/evaluations")}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </AnimatedWrapper>
    );
  }

  const canAdjust = (user?.role === "university_admin" || user?.role === "supervisor") && 
                    evaluation.status !== "finalized";
  const canFinalize = user?.role === "university_admin" && 
                      evaluation.status !== "finalized";

  const starRating = evaluation.starRating || 
                     Math.round(((evaluation.final_score || evaluation.score || 0) / 100) * 5);

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
              onClick={() => router.push("/evaluations")}
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>العودة إلى التقييمات</span>
            </button>
          </div>

          {/* Content Card */}
          <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 text-slate-900 dark:text-white">
                    تفاصيل التقييم
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      المقيم: {evaluation.evaluator_name || evaluation.name || "غير معروف"}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-medium">
                      {evaluation.evaluator_role || evaluation.evaluatorType || "-"}
                    </span>
                  </div>
                </div>
                {/* Status Badge */}
                <span
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                    evaluation.status === "created" || evaluation.status === "draft"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : evaluation.status === "adjusted" || evaluation.status === "submitted"
                      ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400"
                      : evaluation.status === "finalized" || evaluation.status === "final"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {evaluation.status === "created" ? "تم الإنشاء" :
                   evaluation.status === "adjusted" ? "تم التعديل" :
                   evaluation.status === "finalized" ? "مقرار" :
                   evaluation.status || "غير معروف"}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Score Display */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    التقييم
                  </h3>
                  <div className="flex items-center gap-4">
                    {/* Stars */}
                    <div className={`flex gap-1 ${directionRtl ? "flex-row-reverse" : ""}`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < starRating
                              ? "fill-sky-500 text-sky-500 dark:fill-sky-400 dark:text-sky-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    {/* Score */}
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {evaluation.final_score !== undefined 
                          ? `${(evaluation.final_score / 10).toFixed(1)}/10` 
                          : evaluation.score !== undefined 
                          ? `${(evaluation.score / 10).toFixed(1)}/10` 
                          : `${(evaluation.rating || 0) / 10}/10`}
                      </p>
                      {evaluation.original_score !== undefined && 
                       evaluation.original_score !== evaluation.final_score && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-through mt-1">
                          التقييم الأصلي: {(evaluation.original_score / 10).toFixed(1)}/10
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              {evaluation.student_name && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    الطالب المقيّم
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {evaluation.student_name}
                  </p>
                </div>
              )}

              {/* Target Info */}
              {evaluation.target_name && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    الهدف
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-base text-slate-900 dark:text-white">
                      {evaluation.target_name}
                    </p>
                    {evaluation.target_type && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {evaluation.target_type === "case" ? "حالة سريرية" : 
                         evaluation.target_type === "appointment" ? "موعد" : 
                         evaluation.target_type === "session" ? "جلسة" : 
                         evaluation.target_type}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Comment */}
              {evaluation.comment && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    التعليق
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {evaluation.comment}
                  </p>
                </div>
              )}

              {/* Date */}
              {evaluation.date && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    التاريخ
                  </h3>
                  <p className="text-base text-slate-900 dark:text-white">
                    {evaluation.date}
                  </p>
                </div>
              )}

              {/* Actions */}
              {(canAdjust || canFinalize) && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className={`flex flex-wrap gap-3 ${directionRtl ? "flex-row-reverse" : ""}`}>
                    {canAdjust && (
                      <button
                        onClick={() => setShowAdjustModal(true)}
                        disabled={adjusting || finalizing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit2 size={18} />
                        <span>تعديل التقييم</span>
                      </button>
                    )}
                    {canFinalize && (
                      <button
                        onClick={handleFinalize}
                        disabled={adjusting || finalizing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {finalizing ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>جاري الإقرار...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            <span>إقرار التقييم</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-light rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              تعديل التقييم
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  التقييم الجديد (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-dark-light text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  placeholder="0-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  سبب التعديل (اختياري)
                </label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-dark-light text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  placeholder="أدخل سبب التعديل..."
                />
              </div>
              <div className={`flex gap-3 ${directionRtl ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={handleAdjust}
                  disabled={adjusting || !newScore}
                  className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adjusting ? "جاري التعديل..." : "تأكيد التعديل"}
                </button>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustReason("");
                  }}
                  disabled={adjusting}
                  className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedWrapper>
  );
}

export default function EvaluationDetailsPage() {
  return (
    <RoleGuard>
      <EvaluationDetailsInner />
    </RoleGuard>
  );
}

