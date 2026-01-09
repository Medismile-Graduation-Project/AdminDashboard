"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, Loader2, Search, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchStudentsAsync,
  createStudentAsync,
  updateStudentAsync,
  deleteStudentAsync,
  clearError,
} from "@/redux/features/students/studentsSlice";
import { fetchStudentRatingAsync } from "@/redux/features/evaluations/evaluationsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import toast from "react-hot-toast";
import { useRtl } from "@/hooks/useRtl";
import { fetchUniversityDetails, fetchUniversityAdminProfile } from "@/services/universityApi";

export default function StudentsPage() {
  return (
    <RoleGuard>
      <StudentsPageContent />
    </RoleGuard>
  );
}

function StudentsPageContent() {
  const { t, i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();
  const studentsState = useSelector((state) => state.students);
  const students = studentsState?.students || [];
  const loading = studentsState?.loading || false;
  const error = studentsState?.error || null;
  
  const evaluationsState = useSelector((state) => state.evaluations);
  const studentRatings = evaluationsState?.studentRatings || {};
  const studentStatistics = evaluationsState?.studentStatistics || {};

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingRatings, setLoadingRatings] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    student_id: "",
    year_of_study: "",
    specialization: "",
    university: "",
    address: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(storedUser);

      // تعبئة university_id افتراضياً من المستخدم
      let uniId = storedUser?.university_id || storedUser?.university || "";
      
      console.log("🔍 [StudentsPage] Initial university_id from localStorage:", uniId);
      console.log("🔍 [StudentsPage] storedUser:", storedUser);
      
      // تنظيف university ID - إزالة أي : أو رموز غير صالحة
      if (uniId && typeof uniId === 'string') {
        const originalUniId = uniId;
        uniId = uniId.replace(/^:/, '').trim();
        if (originalUniId !== uniId) {
          console.warn("⚠️ [StudentsPage] Cleaned university_id:", originalUniId, "->", uniId);
        }
      }
      
      // التحقق من أن الـ ID ليس :1 أو 1 فقط
      if (uniId && (uniId === '1' || uniId === ':1' || uniId.length < 10)) {
        console.error("❌ [StudentsPage] Invalid university_id format:", uniId);
        uniId = ""; // إعادة تعيين إلى فارغ
      }
      
      if (uniId) {
        console.log("✅ [StudentsPage] Setting university_id to formData:", uniId);
        setFormData((prev) => ({
          ...prev,
          university: uniId,
        }));
      } else {
        console.warn("⚠️ [StudentsPage] No valid university_id found");
      }
    }
  }, []);

  // جلب الطلاب عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchStudentsAsync());
  }, [dispatch]);

  // جلب تقييمات الطلاب بعد تحميلهم
  useEffect(() => {
    if (students.length > 0) {
      students.forEach((student) => {
        const studentId = student.user_id || student.id;
        if (studentId && !studentRatings[studentId] && !loadingRatings[studentId]) {
          setLoadingRatings((prev) => ({ ...prev, [studentId]: true }));
          dispatch(fetchStudentRatingAsync(studentId))
            .catch((error) => {
              // تسجيل الخطأ في development mode للتحقق
              if (process.env.NODE_ENV === "development") {
                console.warn(`Failed to fetch rating for student ${studentId}:`, error);
              }
              // إذا كان الخطأ 404، يعني لا يوجد تقييم عام للطالب
              // لكن قد يكون هناك تقييمات فردية في صفحة التقييمات
            })
            .finally(() => {
              setLoadingRatings((prev) => {
                const newState = { ...prev };
                delete newState[studentId];
                return newState;
              });
            });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students.length, dispatch]);

  // عرض رسائل الخطأ
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      student_id: "",
      year_of_study: "",
      specialization: "",
      university: (() => {
        let uniId = user?.university_id || user?.university || "";
        // تنظيف university ID - إزالة أي : أو رموز غير صالحة
        if (uniId && typeof uniId === 'string') {
          uniId = uniId.replace(/^:/, '').trim();
        }
        return uniId;
      })(),
      address: "",
      phone_number: "",
      date_of_birth: "",
      gender: "",
    });
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    // جلب البيانات من _apiData إذا كانت موجودة
    const apiData = student._apiData || student;
    setFormData({
      username: apiData.username || "",
      email: apiData.email || student.email || "",
      password: "",
      password_confirm: "",
      first_name: apiData.first_name || student.first_name || "",
      last_name: apiData.last_name || student.last_name || "",
      student_id: apiData.student_id || student.student_id || "",
      year_of_study: apiData.year_of_study || student.year_of_study || "",
      specialization: apiData.specialization || student.specialization || "",
      university: apiData.university || student.university || user?.university_id || user?.university || "",
      address: apiData.address || student.address || "",
      phone_number: apiData.phone_number || student.phone_number || "",
      date_of_birth: apiData.date_of_birth || student.date_of_birth || "",
      gender: apiData.gender || student.gender || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (studentId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;

    try {
      await dispatch(deleteStudentAsync(studentId)).unwrap();
      toast.success("تم حذف الطالب بنجاح");
      dispatch(fetchStudentsAsync());
    } catch (error) {
      toast.error(error?.message || "فشل في حذف الطالب");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // التحقق من الحقول المطلوبة
      // first_name و last_name يمكن أن تكونا فارغتين حسب API
      // university_id يتم الحصول عليه تلقائياً من user object
      if (
        !formData.username ||
        !formData.email
      ) {
        toast.error("يرجى ملء جميع الحقول المطلوبة (اسم المستخدم، البريد الإلكتروني)");
        setSubmitLoading(false);
        return;
      }

      // التحقق من password و password_confirm عند الإنشاء فقط
      if (!editingStudent) {
        if (!formData.password || !formData.password_confirm) {
          toast.error("يرجى إدخال كلمة المرور وتأكيدها");
          setSubmitLoading(false);
          return;
        }
        if (formData.password !== formData.password_confirm) {
          toast.error("كلمات المرور غير متطابقة");
          setSubmitLoading(false);
          return;
        }
      }

      if (editingStudent) {
        // عند التعديل، نستخدم البيانات القابلة للتعديل فقط
        const submitData = {
          email: formData.email,
          phone_number: formData.phone_number || null,
          address: formData.address || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          student_id: formData.student_id || null,
          year_of_study: formData.year_of_study ? parseInt(formData.year_of_study) : null,
          specialization: formData.specialization || null,
        };
        
        // إضافة كلمة المرور فقط إذا كانت موجودة
        if (formData.password) {
          submitData.password = formData.password;
          submitData.password_confirm = formData.password_confirm;
        }
        
        await dispatch(
          updateStudentAsync({ userId: editingStudent.user_id || editingStudent.id, studentData: submitData })
        ).unwrap();
        toast.success("تم تحديث الطالب بنجاح");
      } else {
        // عند الإنشاء، نحتاج فقط للحقول المطلوبة حسب API الجديد
        // جلب university_id من Profile مباشرة (الاعتماد على Profile فقط)
        let universityId = null;
        
        if (user?.id && (user?.role === "university_admin" || user?.role === "college_admin")) {
          try {
            const profile = await fetchUniversityAdminProfile();
            
            // استخراج university_id من Profile
            if (profile?.university) {
              if (typeof profile.university === 'object') {
                universityId = profile.university.id || profile.university;
              } else {
                universityId = profile.university;
              }
            } else if (profile?.university_id) {
              universityId = profile.university_id;
            }
            
            // إذا تم جلب university_id، نحدث user object في localStorage
            if (universityId && user) {
              user.university_id = universityId;
              user.university = universityId;
              localStorage.setItem("user", JSON.stringify(user));
              setUser(user); // تحديث state أيضاً
            }
          } catch (error) {
            console.error("Error fetching university admin profile:", error);
            toast.error("فشل في جلب بيانات الجامعة. يرجى المحاولة مرة أخرى.");
            setSubmitLoading(false);
            return;
          }
        }

        // التحقق من أن university_id موجود
        if (!universityId) {
          toast.error("لم يتم العثور على معرف الجامعة. يرجى إعادة تسجيل الدخول.");
          setSubmitLoading(false);
          return;
        }

        // تنظيف university ID (إزالة مسافات فقط)
        const cleanUniversityId = typeof universityId === 'string' ? universityId.trim() : universityId;

        // جلب اسم الجامعة من API
        let universityName = "";
        try {
          const uniData = await fetchUniversityDetails(cleanUniversityId);
          universityName = uniData?.name || "";
        } catch (error) {
          console.error("Error fetching university name:", error);
          toast.error("فشل في جلب اسم الجامعة");
          setSubmitLoading(false);
          return;
        }

        if (!universityName) {
          toast.error("لم يتم العثور على اسم الجامعة");
          setSubmitLoading(false);
          return;
        }

        const submitData = {
          email: formData.email,
          username: formData.username,
          password: formData.password, // مطلوب حسب API
          password_confirm: formData.password_confirm, // مطلوب حسب API
          first_name: formData.first_name || "", // السماح بالقيم الفارغة
          last_name: formData.last_name || "", // السماح بالقيم الفارغة
          university: cleanUniversityId, // استخدام الـ ID النظيف
          university_name: universityName,
          // الحقول الاختيارية
          ...(formData.student_id && { student_id: formData.student_id }),
          ...(formData.year_of_study && { year_of_study: parseInt(formData.year_of_study) || null }),
          ...(formData.specialization && { specialization: formData.specialization }),
        };

        console.log("📤 [StudentsPage] Sending submitData:", submitData);
        console.log("📤 [StudentsPage] University ID:", submitData.university);

        await dispatch(createStudentAsync(submitData)).unwrap();
        toast.success("تم إنشاء الطالب بنجاح");
      }

      setShowForm(false);
      setEditingStudent(null);
      dispatch(fetchStudentsAsync());
    } catch (error) {
      toast.error(error?.message || "فشل في حفظ الطالب");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const name = student.studentName || student.email?.split("@")[0] || "";
    return (
      name.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.phone_number?.toLowerCase().includes(searchLower) ||
      student.student_id?.toString().includes(searchLower) ||
      student.specialization?.toLowerCase().includes(searchLower) ||
      student.year_of_study?.toString().includes(searchLower)
    );
  });

  if (!mounted) return null;

  return (
    <AnimatedWrapper>
      <div className={`p-6 sm:p-8 space-y-6 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              إدارة الطلاب
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              إدارة حسابات الطلاب في الجامعة
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-200 flex items-center gap-2 font-semibold text-sm shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <PlusCircle size={20} />
            إضافة طالب جديد
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-slate-400`} size={20} />
          <input
            type="text"
            placeholder="ابحث عن طالب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all`}
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
            onClick={() => {
              setShowForm(false);
              setEditingStudent(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-light rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {editingStudent ? "تعديل طالب" : "إضافة طالب جديد"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingStudent(null);
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        اسم المستخدم *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    {!editingStudent && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            كلمة المرور *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            تأكيد كلمة المرور *
                          </label>
                          <input
                            type="password"
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        الاسم الأول
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        اسم العائلة
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        رقم الطالب
                      </label>
                      <input
                        type="text"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        السنة الدراسية
                      </label>
                      <input
                        type="number"
                        name="year_of_study"
                        value={formData.year_of_study}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        التخصص
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        رقم الهاتف
                      </label>
                      <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        العنوان
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingStudent(null);
                      }}
                      className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-semibold text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 font-semibold text-sm shadow-sm hover:shadow-md"
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          حفظ
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Students Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-sky-600" size={32} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد طلاب"}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
            <table
              className={`w-full text-sm text-slate-900 dark:text-slate-200 min-w-[900px] ${
                isRtl ? "text-right" : "text-left"
              }`}
              dir={isRtl ? "rtl" : "ltr"}
            >
              <thead className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 dark:from-dark-lighter dark:via-dark-light dark:to-dark-lighter text-white">
                <tr>
                  <th className="px-6 py-4 font-semibold">الاسم</th>
                  <th className="px-6 py-4 font-semibold">البريد الإلكتروني</th>
                  <th className="px-6 py-4 font-semibold">رقم الهاتف</th>
                  <th className="px-6 py-4 font-semibold">السنة الدراسية</th>
                  <th className="px-6 py-4 font-semibold">التخصص</th>
                  <th className="px-6 py-4 font-semibold">التقييم</th>
                  <th className="px-6 py-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => {
                  const name = student.studentName || student.email?.split("@")[0] || "-";
                  const studentId = student.user_id || student.id;
                  const ratingData = studentRatings[studentId] || studentStatistics[studentId]?.rating;
                  const isLoadingRating = loadingRatings[studentId];
                  
                  // حساب النجوم من final_rating (كما يأتي من API)
                  // إذا كانت القيمة أكبر من 100، نقسم على 10 (API يعيد 1000 بدلاً من 100)
                  let finalRating = ratingData?.final_rating || 0;
                  if (finalRating > 100) {
                    finalRating = finalRating / 10;
                  }
                  const starCount = Math.round((finalRating / 100) * 5);
                  
                  return (
                    <motion.tr
                      key={studentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`${
                        idx % 2 === 0
                          ? "bg-sky-50/50 dark:bg-dark-light/30"
                          : "bg-white dark:bg-dark-light"
                      } border-b border-sky-200/50 dark:border-dark-lighter hover:bg-gradient-to-r hover:from-sky-100/50 hover:to-sky-200/50 dark:hover:from-dark-lighter transition-all duration-300`}
                    >
                      <td className="px-6 py-4 font-medium">{name}</td>
                      <td className="px-6 py-4">{student.email || "-"}</td>
                      <td className="px-6 py-4">{student.phone_number || "-"}</td>
                      <td className="px-6 py-4">{student.year_of_study ? `السنة ${student.year_of_study}` : "-"}</td>
                      <td className="px-6 py-4">{student.specialization || "-"}</td>
                      <td className="px-6 py-4">
                        {isLoadingRating ? (
                          <Loader2 className="animate-spin text-sky-600" size={16} />
                        ) : ratingData ? (
                          <div className="flex flex-col gap-1">
                            <div className={`flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < starCount
                                      ? "fill-sky-500 text-sky-500 dark:fill-sky-400 dark:text-sky-400"
                                      : "text-slate-300 dark:text-slate-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {finalRating.toFixed(1)}/100
                              {ratingData.total_evaluations && (
                                <span className="mr-1">({ratingData.total_evaluations} تقييم)</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${isRtl ? "justify-start" : "justify-end"}`}>
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-all duration-200"
                            title="تعديل"
                            aria-label="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(studentId)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="حذف"
                            aria-label="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AnimatedWrapper>
  );
}


