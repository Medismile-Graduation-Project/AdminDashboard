"use client";
import { useState, useEffect } from "react";
import { Star, Loader2, PlusCircle, X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEvaluationsAsync,
  createEvaluationAsync,
  setSearch,
  setStatusFilter,
  setDateFilter,
  setEvaluatorTypeFilter,
  clearError,
} from "../../redux/features/evaluations/evaluationsSlice";
import { fetchStudentsAsync } from "../../redux/features/students/studentsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";

export default function PatientReviews() {
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
  const [formData, setFormData] = useState({
    evaluator_type: "supervisor", // افتراضي للمشرف
    student_id: "",
    appointment_id: "",
    rating: 5,
    comment: "",
  });

  // جلب الطلاب
  const studentsState = useSelector((state) => state.students);
  const students = studentsState?.students || [];

  // جلب التقييمات عند تحميل الصفحة
  useEffect(() => {
    // بناء معاملات البحث
    const params = {};
    
    if (evaluatorTypeFilter !== "all") {
      params.evaluator_type = evaluatorTypeFilter;
    }
    
    dispatch(fetchEvaluationsAsync(params));
    dispatch(fetchStudentsAsync()); // جلب الطلاب للنموذج
  }, [dispatch, evaluatorTypeFilter]);

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
      if (!formData.rating || formData.rating < 1 || formData.rating > 10) {
        toast.error("التقييم يجب أن يكون بين 1 و 10");
        setSubmitLoading(false);
        return;
      }

      if (formData.evaluator_type === "supervisor" && !formData.student_id) {
        toast.error("يجب اختيار طالب عند تقييم المشرف");
        setSubmitLoading(false);
        return;
      }

      // تحضير البيانات للإرسال
      const evaluationData = {
        evaluator_type: formData.evaluator_type,
        rating: parseInt(formData.rating),
        comment: formData.comment || null,
      };

      // إضافة student_id إذا كان موجوداً
      if (formData.student_id) {
        evaluationData.student_id = formData.student_id;
      }

      // إضافة appointment_id إذا كان موجوداً
      if (formData.appointment_id) {
        evaluationData.appointment_id = formData.appointment_id;
      }

      await dispatch(createEvaluationAsync(evaluationData)).unwrap();
      toast.success("تم إضافة التقييم بنجاح");
      setShowForm(false);
      
      // إعادة تعيين النموذج
      setFormData({
        evaluator_type: "supervisor",
        student_id: "",
        appointment_id: "",
        rating: 5,
        comment: "",
      });

      // إعادة جلب التقييمات
      const params = {};
      if (evaluatorTypeFilter !== "all") {
        params.evaluator_type = evaluatorTypeFilter;
      }
      dispatch(fetchEvaluationsAsync(params));
    } catch (error) {
      toast.error(error || "فشل في إضافة التقييم");
    } finally {
      setSubmitLoading(false);
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
        className={`p-4 sm:p-6 min-h-screen ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* العنوان */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-white">
              {t("reviews.title") || "تقييمات المرضى"}
            </h1>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-xl shadow bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition"
            >
              <PlusCircle size={20} />
              <span>{t("reviews.addEvaluation") || "إضافة تقييم"}</span>
            </button>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {reviews.length}
              </p>
              <p className="text-slate-700 dark:text-slate-300">{t("reviews.total") || "المجموع"}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{averageRating}</p>
              <p className="text-slate-700 dark:text-slate-300">{t("reviews.average") || "المتوسط"}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {reviews.filter((r) => r.status === "new").length}
              </p>
              <p className="text-slate-700 dark:text-slate-300">{t("reviews.new") || "جديدة"}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {reviews.filter((r) => r.status === "reviewed").length}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                {t("reviews.reviewed") || "مقروءة"}
              </p>
            </div>
          </div>

          {/* الفلاتر */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder={t("reviews.search") || "ابحث عن التقييمات..."}
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="flex-1 border border-sky-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <select
              value={evaluatorTypeFilter}
              onChange={(e) => dispatch(setEvaluatorTypeFilter(e.target.value))}
              className="border border-sky-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
              className="border border-sky-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">{t("reviews.all") || "الكل"}</option>
              <option value="new">{t("reviews.new") || "جديدة"}</option>
              <option value="reviewed">{t("reviews.reviewed") || "مقروءة"}</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => dispatch(setDateFilter(e.target.value))}
              className="border border-sky-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
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
                      {/* التقييم الرقمي */}
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {review.rating || 0}/10
                      </p>
                      {/* الحالة */}
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          review.status === "new"
                            ? "bg-green-500 text-white dark:bg-green-600"
                            : "bg-blue-500 text-white dark:bg-blue-600"
                        }`}
                      >
                        {t(`reviews.${review.status}`) || review.status}
                      </span>
                    </div>
                  </div>
                ))
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
                  {/* نوع المقيم */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      نوع المقيم
                    </label>
                    <select
                      name="evaluator_type"
                      value={formData.evaluator_type}
                      onChange={handleFormChange}
                      className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                      disabled={submitLoading}
                    >
                      <option value="supervisor">مشرف</option>
                      <option value="patient">مريض</option>
                      <option value="student">طالب</option>
                      <option value="university">جامعة</option>
                      <option value="admin">أدمن</option>
                    </select>
                  </div>

                  {/* اختيار الطالب (مطلوب للمشرف) */}
                  {(formData.evaluator_type === "supervisor" || formData.evaluator_type === "university") && (
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
                            {student.studentName} {student.studentNumber ? `(${student.studentNumber})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* الموعد (اختياري) */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      الموعد (اختياري)
                    </label>
                    <input
                      type="text"
                      name="appointment_id"
                      value={formData.appointment_id}
                      onChange={handleFormChange}
                      placeholder="معرف الموعد (UUID)"
                      className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                      disabled={submitLoading}
                    />
                  </div>

                  {/* التقييم (1-10) */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      التقييم <span className="text-red-500">*</span> (1-10)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleFormChange}
                      min="1"
                      max="10"
                      className="w-full p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                      disabled={submitLoading}
                      required
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
