"use client";
import { useState, useEffect } from "react";
import { Star, Loader2, PlusCircle, X, Save, Send, CheckCircle, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchEvaluationsAsync,
  createEvaluationAsync,
  updateEvaluationAsync,
  submitEvaluationAsync,
  finalizeEvaluationAsync,
  setSearch,
  setStatusFilter,
  setDateFilter,
  setEvaluatorTypeFilter,
  clearError,
} from "../../redux/features/evaluations/evaluationsSlice";
import { fetchStudentsAsync } from "../../redux/features/students/studentsSlice";
import { fetchCases } from "../../redux/features/clinicalCases/clinicalCasesSlice";
import { fetchAppointmentsAsync } from "../../redux/features/appointments/appointmentsSlice";
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

  // State للنموذج
  const [showForm, setShowForm] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null); // للتعديل
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // تحديد evaluator_type - مسؤول الجامعة فقط
  const getDefaultEvaluatorType = () => {
    return "university";
  };
  
  const [formData, setFormData] = useState({
    student_id: "",
    target_type: "case", // case, session, appointment
    case_id: "",
    session_id: "",
    appointment_id: "",
    score: 0, // 0-100
    rubric: "", // JSON string
    comment: "",
  });
  
  // تحديث evaluator_type عند تغيير المستخدم
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        evaluator_type: getDefaultEvaluatorType()
      }));
    }
  }, [user]);

  // جلب الطلاب والحالات والمواعيد
  const studentsState = useSelector((state) => state.students);
  const students = studentsState?.students || [];
  const cases = useSelector((state) => state.clinicalCases?.cases || []);
  const appointments = useSelector((state) => state.appointments?.appointments || []);

  // جلب التقييمات عند تحميل الصفحة
  useEffect(() => {
    if (!userLoaded) return; // انتظر حتى يتم تحميل المستخدم
    
    // بناء معاملات البحث - مسؤول الجامعة فقط
    const params = {};
    
    // مسؤول الجامعة: يمكن عرض جميع التقييمات أو فلترة حسب evaluator_type
    if (evaluatorTypeFilter !== "all") {
      params.evaluator_type = evaluatorTypeFilter;
    }
    
    dispatch(fetchEvaluationsAsync(params));
    dispatch(fetchStudentsAsync()); // جلب الطلاب للنموذج
    // جلب الحالات والمواعيد للنموذج - فلترة حسب المستخدم
    if (user?.role === "supervisor" && user?.id) {
      // المشرف: فقط حالاته
      dispatch(fetchCases({ supervisor_id: user.id }));
      dispatch(fetchAppointmentsAsync({ supervisor_id: user.id }));
    } else if (user?.role === "university_admin") {
      // مسؤول الجامعة: جميع حالات الجامعة (Backend يفلتر تلقائياً)
      dispatch(fetchCases({}));
      dispatch(fetchAppointmentsAsync({}));
    }
  }, [dispatch, userLoaded, user?.id, user?.role, evaluatorTypeFilter]);

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
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // معالجة تعديل تقييم (فقط المسودات)
  const handleEditEvaluation = (review) => {
    if (review.status !== "draft") {
      toast.error("يمكن تعديل المسودات فقط");
      return;
    }
    
    // ملء النموذج ببيانات التقييم الحالي
    const apiData = review._apiData || {};
    setFormData({
      student_id: apiData.student?.id || apiData.student_id || "",
      target_type: apiData.target_type || "case",
      case_id: apiData.case_id || apiData.case?.id || "",
      session_id: apiData.session_id || apiData.session?.id || "",
      appointment_id: apiData.appointment_id || apiData.appointment?.id || "",
      score: apiData.score || review.score || 0,
      rubric: apiData.rubric ? JSON.stringify(apiData.rubric, null, 2) : "",
      comment: apiData.comment || review.comment || "",
    });
    setEditingEvaluation(review);
    setShowForm(true);
  };

  // معالجة تحديث تقييم
  const handleUpdateEvaluation = async (e) => {
    e.preventDefault();
    if (!editingEvaluation) return;
    
    setSubmitLoading(true);

    try {
      // التحقق من البيانات
      if (!formData.student_id) {
        toast.error("يجب اختيار طالب");
        setSubmitLoading(false);
        return;
      }

      if (!formData.target_type) {
        toast.error("يجب اختيار نوع الهدف");
        setSubmitLoading(false);
        return;
      }

      if (formData.score < 0 || formData.score > 100) {
        toast.error("النقاط يجب أن تكون بين 0 و 100");
        setSubmitLoading(false);
        return;
      }

      // التحقق من وجود target_id حسب target_type
      if (formData.target_type === "case" && !formData.case_id) {
        toast.error("يجب اختيار حالة");
        setSubmitLoading(false);
        return;
      }
      if (formData.target_type === "session" && !formData.session_id) {
        toast.error("يجب اختيار جلسة");
        setSubmitLoading(false);
        return;
      }
      if (formData.target_type === "appointment" && !formData.appointment_id) {
        toast.error("يجب اختيار موعد");
        setSubmitLoading(false);
        return;
      }

      // تحضير البيانات للإرسال
      const evaluationData = {
        student_id: formData.student_id,
        target_type: formData.target_type,
        score: parseInt(formData.score),
        comment: formData.comment || null,
      };

      // إضافة target_id حسب target_type
      if (formData.target_type === "case") {
        evaluationData.case_id = formData.case_id;
      } else if (formData.target_type === "session") {
        evaluationData.session_id = formData.session_id;
      } else if (formData.target_type === "appointment") {
        evaluationData.appointment_id = formData.appointment_id;
      }

      // إضافة rubric إذا كان موجوداً
      if (formData.rubric) {
        try {
          evaluationData.rubric = JSON.parse(formData.rubric);
        } catch {
          toast.error("تنسيق JSON غير صحيح للـ rubric");
          setSubmitLoading(false);
          return;
        }
      }

      await dispatch(updateEvaluationAsync({
        evaluationId: editingEvaluation.id,
        evaluationData
      })).unwrap();
      toast.success("تم تحديث التقييم بنجاح");
      setShowForm(false);
      setEditingEvaluation(null);
      
      // إعادة تعيين النموذج
      setFormData({
        student_id: "",
        target_type: "case",
        case_id: "",
        session_id: "",
        appointment_id: "",
        score: 0,
        rubric: "",
        comment: "",
      });

      // إعادة جلب التقييمات
      const params = {};
      if (user?.role === "supervisor") {
        params.evaluator_type = "supervisor";
      } else if (user?.role === "university_admin" && evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      } else if (evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      }
      dispatch(fetchEvaluationsAsync(params));
    } catch (error) {
      toast.error(error || "فشل في تحديث التقييم");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    
    // إذا كان في وضع التعديل، استخدم handleUpdateEvaluation
    if (editingEvaluation) {
      return handleUpdateEvaluation(e);
    }
    
    setSubmitLoading(true);

    try {
      // التحقق من البيانات
      if (!formData.student_id) {
        toast.error("يجب اختيار طالب");
        setSubmitLoading(false);
        return;
      }

      if (!formData.target_type) {
        toast.error("يجب اختيار نوع الهدف");
        setSubmitLoading(false);
        return;
      }

      if (formData.score < 0 || formData.score > 100) {
        toast.error("النقاط يجب أن تكون بين 0 و 100");
        setSubmitLoading(false);
        return;
      }

      // التحقق من وجود target_id حسب target_type
      if (formData.target_type === "case" && !formData.case_id) {
        toast.error("يجب اختيار حالة");
        setSubmitLoading(false);
        return;
      }
      if (formData.target_type === "session" && !formData.session_id) {
        toast.error("يجب اختيار جلسة");
        setSubmitLoading(false);
        return;
      }
      if (formData.target_type === "appointment" && !formData.appointment_id) {
        toast.error("يجب اختيار موعد");
        setSubmitLoading(false);
        return;
      }

      // تحضير البيانات للإرسال
      const evaluationData = {
        student_id: formData.student_id,
        target_type: formData.target_type,
        score: parseInt(formData.score),
        comment: formData.comment || null,
      };

      // إضافة target_id حسب target_type
      if (formData.target_type === "case") {
        evaluationData.case_id = formData.case_id;
      } else if (formData.target_type === "session") {
        evaluationData.session_id = formData.session_id;
      } else if (formData.target_type === "appointment") {
        evaluationData.appointment_id = formData.appointment_id;
      }

      // إضافة rubric إذا كان موجوداً
      if (formData.rubric) {
        try {
          evaluationData.rubric = JSON.parse(formData.rubric);
        } catch {
          toast.error("تنسيق JSON غير صحيح للـ rubric");
          setSubmitLoading(false);
          return;
        }
      }

      await dispatch(createEvaluationAsync(evaluationData)).unwrap();
      toast.success("تم إنشاء التقييم بنجاح");
      setShowForm(false);
      setEditingEvaluation(null);
      
      // إعادة تعيين النموذج
      setFormData({
        student_id: "",
        target_type: "case",
        case_id: "",
        session_id: "",
        appointment_id: "",
        score: 0,
        rubric: "",
        comment: "",
      });

      // إعادة جلب التقييمات
      const params = {};
      if (user?.role === "supervisor") {
        params.evaluator_type = "supervisor";
      } else if (user?.role === "university_admin" && evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      } else if (evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      }
      dispatch(fetchEvaluationsAsync(params));
    } catch (error) {
      toast.error(error || "فشل في إنشاء التقييم");
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Handle Submit Evaluation (draft → submitted)
  const handleSubmitEvaluationStatus = async (evaluationId) => {
    try {
      await dispatch(submitEvaluationAsync(evaluationId)).unwrap();
      toast.success("تم تقديم التقييم بنجاح");
      const params = {};
      if (user?.role === "supervisor") {
        params.evaluator_type = "supervisor";
      } else if (user?.role === "university_admin" && evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      }
      dispatch(fetchEvaluationsAsync(params));
    } catch (error) {
      toast.error(error || "فشل في تقديم التقييم");
    }
  };
  
  // Handle Finalize Evaluation (submitted → final)
  const handleFinalizeEvaluation = async (evaluationId) => {
    try {
      await dispatch(finalizeEvaluationAsync(evaluationId)).unwrap();
      toast.success("تم تثبيت التقييم بنجاح");
      const params = {};
      if (user?.role === "supervisor") {
        params.evaluator_type = "supervisor";
      } else if (user?.role === "university_admin" && evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      }
      dispatch(fetchEvaluationsAsync(params));
    } catch (error) {
      toast.error(error || "فشل في تثبيت التقييم");
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {t("reviews.title") || "تقييمات المرضى"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                إدارة وتتبع جميع التقييمات
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <PlusCircle size={18} />
              <span>{t("reviews.addEvaluation") || "إضافة تقييم"}</span>
            </motion.button>
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
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("reviews.total") || "المجموع"}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 text-center hover:shadow-md transition-all duration-200"
            >
              <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-1">{averageRating}</p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("reviews.average") || "المتوسط"}</p>
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
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("reviews.new") || "جديدة"}</p>
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
                {t("reviews.reviewed") || "مقروءة"}
              </p>
            </motion.div>
          </div>

          {/* الفلاتر */}
          <div className={`flex flex-col md:flex-row gap-3 mb-6 ${isRtl ? "md:flex-row-reverse" : ""}`}>
            <input
              type="text"
              placeholder={t("reviews.search") || "ابحث عن التقييمات..."}
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
              <option value="all">جميع الأنواع</option>
              <option value="patient">من مريض</option>
              <option value="supervisor">من مشرف</option>
              <option value="student">من طالب</option>
              <option value="university">من الجامعة</option>
              <option value="admin">من الأدمن</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-dark-light text-slate-900 dark:text-white 
                focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
            >
              <option value="all">{t("reviews.all") || "الكل"}</option>
              <option value="draft">مسودة</option>
              <option value="submitted">مقدم</option>
              <option value="final">نهائي</option>
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
                            {review.name || "غير معروف"}
                          </h2>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-medium">
                            {review.evaluatorType || "-"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                          {review.date || "-"}
                        </p>
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
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {review.score !== undefined ? `${review.score}/100` : `${review.rating || 0}/10`}
                        </p>
                        {review.target_type && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {review.target_type === "case" ? "حالة" : review.target_type === "session" ? "جلسة" : "موعد"}
                          </span>
                        )}
                        {/* الحالة */}
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                            review.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : review.status === "submitted"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400"
                              : review.status === "final"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {review.status === "draft" ? "مسودة" : review.status === "submitted" ? "مقدم" : review.status === "final" ? "نهائي" : review.status || "جديد"}
                        </span>
                        
                        {/* أزرار الإجراءات */}
                        <div className={`flex gap-2 mt-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                          {(user?.role === "supervisor" || user?.role === "university_admin") && review.status === "draft" && (
                            <>
                              <button
                                onClick={() => handleEditEvaluation(review)}
                                className="px-3 py-1.5 text-sm rounded-lg bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white transition-all duration-200 flex items-center gap-1.5 font-medium shadow-sm hover:shadow-md"
                              >
                                <Edit size={14} />
                                تعديل
                              </button>
                              <button
                                onClick={() => handleSubmitEvaluationStatus(review.id)}
                                className="px-3 py-1.5 text-sm rounded-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white transition-all duration-200 flex items-center gap-1.5 font-medium shadow-sm hover:shadow-md"
                              >
                                <Send size={14} />
                                تقديم
                              </button>
                            </>
                          )}
                          {(user?.role === "supervisor" || user?.role === "university_admin") && review.status === "submitted" && (
                            <button
                              onClick={() => handleFinalizeEvaluation(review.id)}
                              className="px-3 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white transition-all duration-200 flex items-center gap-1.5 font-medium shadow-sm hover:shadow-md"
                            >
                              <CheckCircle size={14} />
                              تثبيت
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-center text-slate-600 dark:text-slate-400 py-12">
                  {loading ? "جاري التحميل..." : (t("reviews.no_results") || "لا توجد تقييمات")}
                </p>
              )}
            </div>
          )}

          {/* Modal لإضافة تقييم جديد */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
              <div className="bg-white dark:bg-dark-light rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className={`flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingEvaluation 
                      ? (t("reviews.editEvaluation") || "تعديل تقييم")
                      : (t("reviews.addEvaluation") || "إضافة تقييم جديد")
                    }
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingEvaluation(null);
                    }}
                    disabled={submitLoading}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={20} className="text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmitEvaluation} className="p-5 sm:p-6 space-y-5">
                  {/* اختيار الطالب */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      الطالب <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                      disabled={submitLoading}
                      required
                    >
                      <option value="">اختر طالباً</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} {student.student_number ? `(${student.student_number})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* نوع الهدف */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      نوع الهدف <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="target_type"
                      value={formData.target_type}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          target_type: e.target.value,
                          case_id: "",
                          session_id: "",
                          appointment_id: "",
                        }));
                      }}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                      disabled={submitLoading}
                      required
                    >
                      <option value="case">حالة سريرية</option>
                      <option value="session">جلسة</option>
                      <option value="appointment">موعد</option>
                    </select>
                  </div>

                  {/* اختيار الحالة/الجلسة/الموعد حسب target_type */}
                  {formData.target_type === "case" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        الحالة <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="case_id"
                        value={formData.case_id}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                        disabled={submitLoading}
                        required
                      >
                        <option value="">اختر حالة</option>
                        {cases.map((caseItem) => (
                          <option key={caseItem.id} value={caseItem.id}>
                            {caseItem.title || caseItem.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.target_type === "session" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        الجلسة <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="session_id"
                        value={formData.session_id}
                        onChange={handleFormChange}
                        placeholder="معرف الجلسة (UUID)"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                        disabled={submitLoading}
                        required
                      />
                    </div>
                  )}

                  {formData.target_type === "appointment" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        الموعد <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="appointment_id"
                        value={formData.appointment_id}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                        disabled={submitLoading}
                        required
                      >
                        <option value="">اختر موعداً</option>
                        {appointments.map((appointment) => (
                          <option key={appointment.id} value={appointment.id}>
                            {appointment.date ? new Date(appointment.date).toLocaleDateString("ar-SA") : appointment.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* النقاط (0-100) */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      النقاط <span className="text-red-500">*</span> (0-100)
                    </label>
                    <input
                      type="number"
                      name="score"
                      value={formData.score}
                      onChange={handleFormChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200"
                      disabled={submitLoading}
                      required
                    />
                  </div>

                  {/* Rubric (JSON) */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      Rubric (JSON - اختياري)
                    </label>
                    <textarea
                      name="rubric"
                      value={formData.rubric}
                      onChange={handleFormChange}
                      rows="3"
                      placeholder='{"criteria": "value"}'
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200 font-mono text-sm resize-none"
                      disabled={submitLoading}
                    />
                  </div>

                  {/* التعليق */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                      التعليق (اختياري)
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleFormChange}
                      rows="3"
                      placeholder="أدخل تعليقك..."
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white dark:bg-dark text-slate-900 dark:text-white transition-all duration-200 resize-none"
                      disabled={submitLoading}
                    />
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className={`flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse justify-start" : "justify-end"}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingEvaluation(null);
                      }}
                      disabled={submitLoading}
                      className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-semibold text-sm disabled:opacity-50"
                    >
                      {t("students.cancel") || "إلغاء"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                      {submitLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {t("students.save") || "حفظ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

