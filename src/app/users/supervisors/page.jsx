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
      const uniId = storedUser?.university_id || storedUser?.university || "";
      if (uniId) {
        setFormData((prev) => ({
          ...prev,
          university: uniId,
        }));
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
      university: user?.university_id || user?.university || "",
      department: "",
      position: "",
      license_number: "",
    });
    setShowForm(true);
  };

  const handleEdit = (supervisor) => {
    setEditingSupervisor(supervisor);
    setFormData({
      username: supervisor.username || "",
      email: supervisor.email || "",
      password: "",
      password_confirm: "",
      first_name: supervisor.first_name || "",
      last_name: supervisor.last_name || "",
      university: supervisor.university || user?.university_id || user?.university || "",
      department: supervisor.department || "",
      position: supervisor.position || "",
      license_number: supervisor.license_number || "",
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
        (!editingSupervisor && (!formData.password || !formData.password_confirm)) ||
        !formData.first_name ||
        !formData.last_name ||
        !formData.university
      ) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        setSubmitLoading(false);
        return;
      }

      // التحقق من تطابق كلمات المرور
      if (!editingSupervisor && formData.password !== formData.password_confirm) {
        toast.error("كلمات المرور غير متطابقة");
        setSubmitLoading(false);
        return;
      }

      const submitData = { ...formData };
      if (editingSupervisor) {
        // عند التعديل، لا نرسل كلمة المرور إذا كانت فارغة
        if (!submitData.password) {
          delete submitData.password;
          delete submitData.password_confirm;
        }
        await dispatch(
          updateSupervisorAsync({ id: editingSupervisor.user_id || editingSupervisor.id, data: submitData })
        ).unwrap();
        toast.success("تم تحديث المشرف بنجاح");
      } else {
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
    const searchLower = searchTerm.toLowerCase();
    const name = supervisor.supervisorName || `${supervisor.first_name || ""} ${supervisor.last_name || ""}`;
    return (
      name.toLowerCase().includes(searchLower) ||
      supervisor.email?.toLowerCase().includes(searchLower) ||
      supervisor.department?.toLowerCase().includes(searchLower) ||
      supervisor.position?.toLowerCase().includes(searchLower)
    );
  });

  if (!mounted) return null;

  return (
    <AnimatedWrapper>
      <div className={`p-6 space-y-6 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              إدارة المشرفين
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              إدارة حسابات المشرفين في الجامعة
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            إضافة مشرف جديد
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="ابحث عن مشرف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowForm(false);
              setEditingSupervisor(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-light rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {editingSupervisor ? "تعديل مشرف" : "إضافة مشرف جديد"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingSupervisor(null);
                    }}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        اسم المستخدم *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    {!editingSupervisor && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            كلمة المرور *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            تأكيد كلمة المرور *
                          </label>
                          <input
                            type="password"
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        الاسم الأول *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        اسم العائلة *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        القسم
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        المنصب
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        رقم الرخصة
                      </label>
                      <input
                        type="text"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingSupervisor(null);
                      }}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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

        {/* Supervisors List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-sky-600" size={32} />
          </div>
        ) : filteredSupervisors.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد مشرفين"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSupervisors.map((supervisor) => {
              const name = supervisor.supervisorName || `${supervisor.first_name || ""} ${supervisor.last_name || ""}`;
              return (
                <motion.div
                  key={supervisor.user_id || supervisor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white dark:bg-dark-light rounded-lg shadow border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{supervisor.email}</p>
                      {supervisor.department && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          القسم: {supervisor.department}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(supervisor)}
                        className="p-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(supervisor.user_id || supervisor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {supervisor.position && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      المنصب: {supervisor.position}
                    </p>
                  )}
                  {supervisor.license_number && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      رقم الرخصة: {supervisor.license_number}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AnimatedWrapper>
  );
}


