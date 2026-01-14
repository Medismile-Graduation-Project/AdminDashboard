"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, Loader2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchSupervisorsAsync,
  createSupervisorAsync,
  updateSupervisorAsync,
  deleteSupervisorAsync,
  clearError,
} from "@/redux/features/supervisors/supervisorsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import toast from "react-hot-toast";
import { useRtl } from "@/hooks/useRtl";
import { fetchUniversityDetails, fetchUniversityAdminProfile } from "@/services/universityApi";

export default function SupervisorsPage() {
  return (
    <RoleGuard>
      <SupervisorsPageContent />
    </RoleGuard>
  );
}

function SupervisorsPageContent() {
  const { t, i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();
  const supervisorsState = useSelector((state) => state.supervisors);
  const supervisors = supervisorsState?.supervisors || [];
  const loading = supervisorsState?.loading || false;
  const error = supervisorsState?.error || null;

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    university: "",
    phone_number: "",
    address: "",
    date_of_birth: "",
    gender: "",
    department: "",
    position: "",
    license_number: "",
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(storedUser);

      // تعبئة university_id افتراضياً من المستخدم
      let uniId = storedUser?.university_id || storedUser?.university || "";
      
      console.log("🔍 [SupervisorsPage] Initial university_id from localStorage:", uniId);
      console.log("🔍 [SupervisorsPage] storedUser:", storedUser);
      
      // تنظيف university ID - إزالة أي : أو رموز غير صالحة
      if (uniId && typeof uniId === 'string') {
        const originalUniId = uniId;
        uniId = uniId.replace(/^:/, '').trim();
        if (originalUniId !== uniId) {
          console.warn("⚠️ [SupervisorsPage] Cleaned university_id:", originalUniId, "->", uniId);
        }
      }
      
      // التحقق من أن الـ ID ليس :1 أو 1 فقط
      if (uniId && (uniId === '1' || uniId === ':1' || uniId.length < 10)) {
        console.error("❌ [SupervisorsPage] Invalid university_id format:", uniId);
        uniId = ""; // إعادة تعيين إلى فارغ
      }

      if (uniId) {
        console.log("✅ [SupervisorsPage] Setting university_id to formData:", uniId);
        setFormData((prev) => ({
          ...prev,
          university: uniId,
        }));
      } else {
        console.warn("⚠️ [SupervisorsPage] No valid university_id found");
      }
    }
  }, []);

  // جلب المشرفين عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchSupervisorsAsync());
  }, [dispatch]);

  // عرض رسائل الخطأ
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAdd = () => {
    setEditingSupervisor(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      university: (() => {
        let uniId = user?.university_id || user?.university || "";
        // تنظيف university ID - إزالة أي : أو رموز غير صالحة
        if (uniId && typeof uniId === 'string') {
          uniId = uniId.replace(/^:/, '').trim();
        }
        return uniId;
      })(),
      phone_number: "",
      address: "",
      date_of_birth: "",
      gender: "",
      department: "",
      position: "",
      license_number: "",
    });
    setShowForm(true);
  };

  const handleEdit = (supervisor) => {
    setEditingSupervisor(supervisor);
    // جلب البيانات من _apiData إذا كانت موجودة
    const apiData = supervisor._apiData || supervisor;
    // تنظيف university ID
    let uniId = apiData.university || supervisor.university || user?.university_id || user?.university || "";
    if (uniId && typeof uniId === 'string') {
      uniId = uniId.replace(/^:/, '').trim();
    }
    
    setFormData({
      username: apiData.username || "",
      email: apiData.email || supervisor.email || "",
      password: "",
      password_confirm: "",
      first_name: apiData.first_name || supervisor.first_name || "",
      last_name: apiData.last_name || supervisor.last_name || "",
      university: uniId,
      phone_number: apiData.phone_number || supervisor.phone_number || "",
      address: apiData.address || supervisor.address || "",
      date_of_birth: apiData.date_of_birth || supervisor.date_of_birth || "",
      gender: apiData.gender || supervisor.gender || "",
      department: apiData.department || supervisor.department || "",
      position: apiData.position || supervisor.position || "",
      license_number: apiData.license_number || supervisor.license_number || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (supervisorId) => {
    if (!confirm("هل أنت متأكد من حذف هذا المشرف؟")) return;

    try {
      await dispatch(deleteSupervisorAsync(supervisorId)).unwrap();
      toast.success("تم حذف المشرف بنجاح");
      dispatch(fetchSupervisorsAsync());
    } catch (error) {
      toast.error(error?.message || "فشل في حذف المشرف");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // التحقق من الحقول المطلوبة
      if (
        !formData.username ||
        !formData.email ||
        !formData.first_name ||
        !formData.last_name ||
        !formData.university
      ) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        setSubmitLoading(false);
        return;
      }

      // التحقق من password و password_confirm عند الإنشاء فقط
      if (!editingSupervisor) {
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

      if (editingSupervisor) {
        // عند التعديل، نستخدم البيانات القابلة للتعديل فقط
        const submitData = {
          email: formData.email,
          phone_number: formData.phone_number || null,
          address: formData.address || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          department: formData.department || null,
          position: formData.position || null,
          license_number: formData.license_number || null,
        };
        
        // إضافة كلمة المرور فقط إذا كانت موجودة
        if (formData.password) {
          submitData.password = formData.password;
          submitData.password_confirm = formData.password_confirm;
        }
        
        await dispatch(
          updateSupervisorAsync({ id: editingSupervisor.user_id || editingSupervisor.id, data: submitData })
        ).unwrap();
        toast.success("تم تحديث المشرف بنجاح");
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
          first_name: formData.first_name,
          last_name: formData.last_name,
          university: cleanUniversityId, // استخدام الـ ID النظيف
          university_name: universityName,
          // الحقول الاختيارية
          ...(formData.department && { department: formData.department }),
          ...(formData.position && { position: formData.position }),
          ...(formData.license_number && { license_number: formData.license_number }),
        };

        console.log("📤 [SupervisorsPage] Sending submitData:", submitData);
        console.log("📤 [SupervisorsPage] University ID:", submitData.university);

        await dispatch(createSupervisorAsync(submitData)).unwrap();
        toast.success("تم إنشاء المشرف بنجاح");
      }

      setShowForm(false);
      setEditingSupervisor(null);
      dispatch(fetchSupervisorsAsync());
    } catch (error) {
      toast.error(error?.message || "فشل في حفظ المشرف");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredSupervisors = supervisors.filter((supervisor) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const name = supervisor.supervisorName || supervisor.email?.split("@")[0] || "";
    return (
      name.toLowerCase().includes(searchLower) ||
      supervisor.email?.toLowerCase().includes(searchLower) ||
      supervisor.phone_number?.toLowerCase().includes(searchLower) ||
      supervisor.department?.toLowerCase().includes(searchLower) ||
      supervisor.position?.toLowerCase().includes(searchLower)
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
              إدارة المشرفين
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              إدارة حسابات المشرفين في الجامعة
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-200 flex items-center gap-2 font-semibold text-sm shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <PlusCircle size={20} />
            إضافة مشرف جديد
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-slate-400`} size={20} />
          <input
            type="text"
            placeholder="ابحث عن مشرف..."
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
              setEditingSupervisor(null);
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
                    {editingSupervisor ? "تعديل مشرف" : "إضافة مشرف جديد"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingSupervisor(null);
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
                    {!editingSupervisor && (
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
                        الاسم الأول *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        اسم العائلة *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
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
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        تاريخ الميلاد
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        الجنس
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      >
                        <option value="">اختر الجنس</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        القسم
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        المنصب
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        رقم الرخصة
                      </label>
                      <input
                        type="text"
                        name="license_number"
                        value={formData.license_number}
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
                        setEditingSupervisor(null);
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

        {/* Supervisors Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-sky-600" size={32} />
          </div>
        ) : filteredSupervisors.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد مشرفين"}
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
                  <th className="px-6 py-4 font-semibold">البريد الإلكتروني</th>
                  <th className="px-6 py-4 font-semibold">اسم المستخدم</th>
                  <th className="px-6 py-4 font-semibold">العنوان</th>
                  <th className="px-6 py-4 font-semibold">رقم الهاتف</th>
                  <th className="px-6 py-4 font-semibold">المنصب</th>
                  <th className="px-6 py-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupervisors.map((supervisor, idx) => {
                  // استخراج اسم المستخدم من البريد الإلكتروني
                  const username = supervisor.email ? supervisor.email.split("@")[0] : "-";
                  
                  return (
                    <motion.tr
                      key={supervisor.user_id || supervisor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`${
                        idx % 2 === 0
                          ? "bg-sky-50/50 dark:bg-dark-light/30"
                          : "bg-white dark:bg-dark-light"
                      } border-b border-sky-200/50 dark:border-dark-lighter hover:bg-gradient-to-r hover:from-sky-100/50 hover:to-sky-200/50 dark:hover:from-dark-lighter transition-all duration-300`}
                    >
                      <td className="px-6 py-4 font-medium">{supervisor.email || "-"}</td>
                      <td className="px-6 py-4">{username}</td>
                      <td className="px-6 py-4">{supervisor.address || "-"}</td>
                      <td className="px-6 py-4">{supervisor.phone_number || "-"}</td>
                      <td className="px-6 py-4">{supervisor.position || "-"}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${isRtl ? "justify-start" : "justify-end"}`}>
                          <button
                            onClick={() => handleEdit(supervisor)}
                            className="p-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-all duration-200"
                            title="تعديل"
                            aria-label="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(supervisor.user_id || supervisor.id)}
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


