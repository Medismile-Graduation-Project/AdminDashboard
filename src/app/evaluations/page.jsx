"use client";
import { useState, useEffect } from "react";
import { Star, Loader2, PlusCircle, X, Save, Send, CheckCircle } from "lucide-react";
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

  // State للنموذج
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // تحديد evaluator_type حسب دور المستخدم
  const getDefaultEvaluatorType = () => {
    if (user?.role === "supervisor") return "supervisor";
    if (user?.role === "university_admin") return "university";
    return "supervisor"; // افتراضي
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

  // جلب معلومات المستخدم
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  // جلب التقييمات عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      // بناء معاملات البحث
      const params = {};
      
      // المشرف: يعرض التقييمات التي قام بها فقط (evaluator_type: supervisor)
      if (user.role === "supervisor") {
        params.evaluator_type = "supervisor";
      }
      // مسؤول الجامعة: يعرض جميع التقييمات أو تقييماته (evaluator_type: university)
      else if (user.role === "university_admin") {
        // يمكن عرض جميع التقييمات أو فلترة حسب evaluator_type
        if (evaluatorTypeFilter !== "all") {
          params.evaluator_type = evaluatorTypeFilter;
        }
      }
      // للمستخدمين الآخرين
      else if (evaluatorTypeFilter !== "all") {
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
    }
  }, [dispatch, evaluatorTypeFilter, user]);

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

  // معالجة إضافة تقييم جديد
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
              {t("reviews.title") || "تقييمات المرضى"}
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 
                hover:from-sky-700 hover:to-sky-800 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 
                text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={20} />
              <span>{t("reviews.addEvaluation") || "إضافة تقييم"}</span>
            </motion.button>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-dark-light border-2 border-sky-200/50 dark:border-dark-lighter shadow-lg rounded-2xl p-4 sm:p-5 text-center hover:shadow-xl transition-all duration-300"
            >
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
                {reviews.length}
              </p>
              <p className="text-sm sm:text-base text-sky-700 dark:text-sky-300 mt-1">{t("reviews.total") || "المجموع"}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-dark-light border-2 border-sky-200/50 dark:border-dark-lighter shadow-lg rounded-2xl p-4 sm:p-5 text-center hover:shadow-xl transition-all duration-300"
            >
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">{averageRating}</p>
              <p className="text-sm sm:text-base text-sky-700 dark:text-sky-300 mt-1">{t("reviews.average") || "المتوسط"}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white dark:bg-dark-light border-2 border-sky-200/50 dark:border-dark-lighter shadow-lg rounded-2xl p-4 sm:p-5 text-center hover:shadow-xl transition-all duration-300"
            >
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
                {reviews.filter((r) => r.status === "new").length}
              </p>
              <p className="text-sm sm:text-base text-sky-700 dark:text-sky-300 mt-1">{t("reviews.new") || "جديدة"}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white dark:bg-dark-light border-2 border-sky-200/50 dark:border-dark-lighter shadow-lg rounded-2xl p-4 sm:p-5 text-center hover:shadow-xl transition-all duration-300"
            >
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
                {reviews.filter((r) => r.status === "reviewed").length}
              </p>
              <p className="text-sm sm:text-base text-sky-700 dark:text-sky-300 mt-1">
                {t("reviews.reviewed") || "مقروءة"}
              </p>
            </motion.div>
          </div>

          {/* الفلاتر */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-6">
            <input
              type="text"
              placeholder={t("reviews.search") || "ابحث عن التقييمات..."}
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="flex-1 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl px-4 py-2.5 outline-none bg-white dark:bg-dark-light 
                text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <select
              value={evaluatorTypeFilter}
              onChange={(e) => dispatch(setEvaluatorTypeFilter(e.target.value))}
              className="border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl px-4 py-2.5 bg-white dark:bg-dark-light text-slate-900 dark:text-white 
                focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 transition-all duration-300 shadow-sm hover:shadow-md"
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
              className="border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl px-4 py-2.5 bg-white dark:bg-dark-light text-slate-900 dark:text-white 
                focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 transition-all duration-300 shadow-sm hover:shadow-md"
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
              className="border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl px-4 py-2.5 bg-white dark:bg-dark-light text-slate-900 dark:text-white 
                focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 transition-all duration-300 shadow-sm hover:shadow-md"
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
                      className="bg-white dark:bg-dark-light border-2 border-sky-200/50 dark:border-dark-lighter shadow-lg rounded-2xl p-4 sm:p-6 
                        flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
                            {review.name || "غير معروف"}
                          </h2>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {review.evaluatorType || "-"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          {review.date || "-"}
                        </p>
                        {review.comment && (
                          <p className="mt-2 text-slate-700 dark:text-slate-300">
                            {review.comment}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        {/* النجوم - تحويل من 1-10 إلى 5 نجوم */}
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starRating = review.starRating || Math.round((review.rating || 0) / 2);
                            return (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < starRating
                                    ? "fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400"
                                    : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            );
                          })}
                        </div>
                        {/* التقييم الرقمي (Score 0-100) */}
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {review.score !== undefined ? `${review.score}/100` : `${review.rating || 0}/10`}
                        </p>
                        {review.target_type && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                            {review.target_type === "case" ? "حالة" : review.target_type === "session" ? "جلسة" : "موعد"}
                          </span>
                        )}
                        {/* الحالة */}
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            review.status === "draft"
                              ? "bg-yellow-500 text-white dark:bg-yellow-600"
                              : review.status === "submitted"
                              ? "bg-blue-500 text-white dark:bg-blue-600"
                              : review.status === "final"
                              ? "bg-green-500 text-white dark:bg-green-600"
                              : "bg-gray-500 text-white dark:bg-gray-600"
                          }`}
                        >
                          {review.status === "draft" ? "مسودة" : review.status === "submitted" ? "مقدم" : review.status === "final" ? "نهائي" : review.status || "جديد"}
                        </span>
                        
                        {/* أزرار الإجراءات */}
                        {(user?.role === "supervisor" || user?.role === "university_admin") && review.status === "draft" && (
                          <button
                            onClick={() => handleSubmitEvaluationStatus(review.id)}
                            className="mt-2 px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition flex items-center gap-1"
                          >
                            <Send size={14} />
                            تقديم
                          </button>
                        )}
                        {(user?.role === "supervisor" || user?.role === "university_admin") && review.status === "submitted" && (
                          <button
                            onClick={() => handleFinalizeEvaluation(review.id)}
                            className="mt-2 px-3 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white transition flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            تثبيت
                          </button>
                        )}
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
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-sky-200 to-blue-900 dark:from-slate-700 dark:to-slate-800 text-white">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {t("reviews.addEvaluation") || "إضافة تقييم جديد"}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    disabled={submitLoading}
                    className="p-1 rounded-full hover:bg-blue-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-white transition-colors disabled:opacity-50"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <form onSubmit={handleSubmitEvaluation} className="p-4 sm:p-6 space-y-4">
                  {/* اختيار الطالب */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      الطالب <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleFormChange}
                      className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
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
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
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
                      className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
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
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                        الحالة <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="case_id"
                        value={formData.case_id}
                        onChange={handleFormChange}
                        className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
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
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                        الجلسة <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="session_id"
                        value={formData.session_id}
                        onChange={handleFormChange}
                        placeholder="معرف الجلسة (UUID)"
                        className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                        disabled={submitLoading}
                        required
                      />
                    </div>
                  )}

                  {formData.target_type === "appointment" && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                        الموعد <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="appointment_id"
                        value={formData.appointment_id}
                        onChange={handleFormChange}
                        className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
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
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      النقاط <span className="text-red-500">*</span> (0-100)
                    </label>
                    <input
                      type="number"
                      name="score"
                      value={formData.score}
                      onChange={handleFormChange}
                      min="0"
                      max="100"
                      className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                      disabled={submitLoading}
                      required
                    />
                  </div>

                  {/* Rubric (JSON) */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      Rubric (JSON - اختياري)
                    </label>
                    <textarea
                      name="rubric"
                      value={formData.rubric}
                      onChange={handleFormChange}
                      rows="3"
                      placeholder='{"criteria": "value"}'
                      className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition font-mono text-sm"
                      disabled={submitLoading}
                    />
                  </div>

                  {/* التعليق */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      التعليق (اختياري)
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleFormChange}
                      rows="3"
                      placeholder="أدخل تعليقك..."
                      className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                      disabled={submitLoading}
                    />
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      disabled={submitLoading}
                      className="p-2 sm:p-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 transition disabled:opacity-50"
                    >
                      {t("students.cancel") || "إلغاء"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="p-2 sm:p-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 transition disabled:opacity-50"
                    >
                      {submitLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}{" "}
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

export default function EvaluationsPage() {
  // صفحة التقييمات متاحة للمشرف ومسؤول الجامعة
  return (
    <RoleGuard allowedRoles={["supervisor", "university_admin"]}>
      <EvaluationsContent />
    </RoleGuard>
  );
}
