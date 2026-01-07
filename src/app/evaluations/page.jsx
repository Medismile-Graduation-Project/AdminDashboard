"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Loader2, Send, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchEvaluationsAsync,
  submitEvaluationAsync,
  finalizeEvaluationAsync,
  setSearch,
  setStatusFilter,
  setDateFilter,
  setEvaluatorTypeFilter,
  clearError,
} from "../../redux/features/evaluations/evaluationsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";
import RoleGuard from "@/components/RoleGuard";

export default function EvaluationsPage() {
  return (
    <RoleGuard>
      <EvaluationsContent />
    </RoleGuard>
  );
}

function EvaluationsContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const evaluationsState = useSelector((state) => state.evaluations);
  const reviews = evaluationsState?.reviews || [];
  const loading = evaluationsState?.loading || false;
  const error = evaluationsState?.error || null;
  const search = evaluationsState?.search || "";
  const statusFilter = evaluationsState?.statusFilter || "all";
  const dateFilter = evaluationsState?.dateFilter || "";
  const evaluatorTypeFilter = evaluationsState?.evaluatorTypeFilter || "all";

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // جلب معلومات المستخدم أولاً
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
    setUserLoaded(true);
  }, []);

  // جلب التقييمات عند تحميل الصفحة
  useEffect(() => {
    if (!userLoaded) return; // انتظر حتى يتم تحميل المستخدم
    
    // بناء معاملات البحث - مسؤول الجامعة
    const params = {};
    
    // Query Parameters الجديدة حسب التوثيق
    if (statusFilter !== "all") {
      params.status = statusFilter; // created, adjusted, finalized
    }
    if (evaluatorTypeFilter !== "all") {
      // استخدام evaluator_role (الجديد) أو evaluator_type (القديم للتوافق)
      params.evaluator_role = evaluatorTypeFilter;
      params.evaluator_type = evaluatorTypeFilter; // للتوافق
    }
    
    dispatch(fetchEvaluationsAsync(params));
  }, [dispatch, userLoaded, user?.id, user?.role, statusFilter, evaluatorTypeFilter]);

  // عرض رسائل الخطأ
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // حساب متوسط التقييم
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length / 10 * 5).toFixed(1)
    : "0.0";

  // 🔎 الفلاتر
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.name?.toLowerCase().includes(search.toLowerCase()) ||
      review.comment?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || review.status === statusFilter;
    
    const matchesDate = 
      !dateFilter || review.date?.includes(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Handle Submit Evaluation (draft → submitted)
  const handleSubmitEvaluationStatus = async (evaluationId) => {
    try {
      await dispatch(submitEvaluationAsync(evaluationId)).unwrap();
      toast.success(t("reviews.submitSuccess"));
      const params = {};
      if (user?.role === "university_admin" && evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      }
      dispatch(fetchEvaluationsAsync(params));
    } catch (error) {
      toast.error(error || t("reviews.submitError"));
    }
  };
  
  // Handle Finalize Evaluation (submitted → final)
  const handleFinalizeEvaluation = async (evaluationId) => {
    try {
      await dispatch(finalizeEvaluationAsync(evaluationId)).unwrap();
      toast.success(t("reviews.finalizeSuccess"));
      const params = {};
      if (user?.role === "university_admin" && evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      }
      dispatch(fetchEvaluationsAsync(params));
    } catch (error) {
      toast.error(error || t("reviews.finalizeError"));
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
          {/* العنوان */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {t("reviews.title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              {t("reviews.description")}
            </p>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 text-center hover:shadow-md transition-all duration-200"
            >
              <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-1">
                {reviews.length}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("reviews.total")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 text-center hover:shadow-md transition-all duration-200"
            >
              <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-1">{averageRating}</p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("reviews.average")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 text-center hover:shadow-md transition-all duration-200"
            >
              <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-1">
                {reviews.filter((r) => r.status === "new").length}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("reviews.new")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 text-center hover:shadow-md transition-all duration-200"
            >
              <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-1">
                {reviews.filter((r) => r.status === "reviewed").length}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("reviews.reviewed")}
              </p>
            </motion.div>
          </div>

          {/* الفلاتر */}
          <div className={`flex flex-col md:flex-row gap-3 mb-6 ${isRtl ? "md:flex-row-reverse" : ""}`}>
            <input
              type="text"
              placeholder={t("reviews.searchPlaceholder")}
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 outline-none bg-white dark:bg-dark-light 
                text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
            />
            <select
              value={evaluatorTypeFilter}
              onChange={(e) => dispatch(setEvaluatorTypeFilter(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-dark-light text-slate-900 dark:text-white 
                focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
            >
              <option value="all">{t("reviews.evaluatorTypes.all")}</option>
              <option value="patient">{t("reviews.evaluatorTypes.patient")}</option>
              <option value="supervisor">{t("reviews.evaluatorTypes.supervisor")}</option>
              <option value="student">{t("reviews.evaluatorTypes.student")}</option>
              <option value="university">{t("reviews.evaluatorTypes.university")}</option>
              <option value="admin">{t("reviews.evaluatorTypes.admin")}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-dark-light text-slate-900 dark:text-white 
                focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
            >
              <option value="all">{t("reviews.all")}</option>
              <option value="created">تم الإنشاء</option>
              <option value="adjusted">تم التعديل</option>
              <option value="finalized">مقرار</option>
              {/* للتوافق مع النظام القديم */}
              <option value="draft">{t("reviews.statuses.draft")}</option>
              <option value="submitted">{t("reviews.statuses.submitted")}</option>
              <option value="final">{t("reviews.statuses.final")}</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => dispatch(setDateFilter(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-dark-light text-slate-900 dark:text-white 
                focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
            />
          </div>

          {/* Loading State */}
          {loading && reviews.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}

          {/* قائمة التقييمات */}
          {!loading && (
            <div className="space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, idx) => {
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 
                        flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-1">
                        <div className={`flex items-center gap-3 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                            <Link 
                              href={`/evaluations/${review.id}`}
                              className="hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                            >
                              {review.evaluator_name || review.name || "غير معروف"}
                            </Link>
                          </h2>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-medium">
                            {review.evaluator_role || review.evaluatorType || "-"}
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {review.date || "-"}
                          </p>
                          {review.student_name && (
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              الطالب: {review.student_name}
                            </p>
                          )}
                          {review.target_name && (
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              الهدف: {review.target_name}
                            </p>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                      <div className={`flex flex-col gap-3 ${isRtl ? "items-start md:items-start" : "items-start md:items-end"}`}>
                        {/* النجوم - تحويل من 1-10 إلى 5 نجوم */}
                        <div className={`flex gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starRating = review.starRating || Math.round((review.rating || 0) / 2);
                            return (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < starRating
                                    ? "fill-sky-500 text-sky-500 dark:fill-sky-400 dark:text-sky-400"
                                    : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            );
                          })}
                        </div>
                        {/* التقييم الرقمي (Score 0-100) */}
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {review.final_score !== undefined ? `${review.final_score}/100` : review.score !== undefined ? `${review.score}/100` : `${review.rating || 0}/10`}
                          </p>
                          {review.original_score !== undefined && review.original_score !== review.final_score && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-through">
                              {review.original_score}/100
                            </p>
                          )}
                        </div>
                        {review.target_type && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {review.target_type === "case" ? "حالة سريرية" : review.target_type === "appointment" ? "موعد" : review.target_type === "session" ? "جلسة" : review.target_type}
                          </span>
                        )}
                        {/* الحالة */}
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                            review.status === "created" || review.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : review.status === "adjusted" || review.status === "submitted"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400"
                              : review.status === "finalized" || review.status === "final"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {review.status === "created" ? "تم الإنشاء" :
                           review.status === "adjusted" ? "تم التعديل" :
                           review.status === "finalized" ? "مقرار" :
                           review.status === "draft" ? t("reviews.statuses.draft") :
                           review.status === "submitted" ? t("reviews.statuses.submitted") :
                           review.status === "final" ? t("reviews.statuses.final") :
                           review.status || t("reviews.statuses.new")}
                        </span>
                        
                        {/* أزرار الإجراءات */}
                        <div className={`flex gap-2 mt-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                          {user?.role === "university_admin" && review.status === "draft" && (
                            <button
                              onClick={() => handleSubmitEvaluationStatus(review.id)}
                              className="px-3 py-1.5 text-sm rounded-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white transition-all duration-200 flex items-center gap-1.5 font-medium shadow-sm hover:shadow-md"
                            >
                              <Send size={14} />
                              {t("reviews.submit")}
                            </button>
                          )}
                          {user?.role === "university_admin" && review.status === "submitted" && (
                            <button
                              onClick={() => handleFinalizeEvaluation(review.id)}
                              className="px-3 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white transition-all duration-200 flex items-center gap-1.5 font-medium shadow-sm hover:shadow-md"
                            >
                              <CheckCircle size={14} />
                              {t("reviews.finalize")}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-center text-slate-600 dark:text-slate-400 py-12">
                  {loading ? t("reviews.loading") : t("reviews.no_results")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

