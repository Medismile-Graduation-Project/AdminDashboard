"use client";

import { useState, useEffect } from "react";
import { PlusCircle, X, Save, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchSupervisorsAsync,
  createSupervisorAsync,
  clearError,
} from "../../redux/features/supervisors/supervisorsSlice";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";

function SupervisorsManagementContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const supervisorsState = useSelector((state) => state.supervisors);
  const supervisors = supervisorsState?.supervisors || [];
  const loading = supervisorsState?.loading || false;
  const error = supervisorsState?.error || null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [user, setUser] = useState(null);

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

  // جلب بيانات المستخدم من localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(storedUser);
      
      // تعيين university من user
      const uniId = storedUser?.university_id || storedUser?.university || "";
      if (uniId) {
        setFormData((prev) => ({ ...prev, university: uniId }));
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // التحقق من الحقول المطلوبة
      if (
        !formData.username ||
        !formData.email ||
        !formData.password ||
        !formData.password_confirm ||
        !formData.first_name ||
        !formData.last_name ||
        !formData.university
      ) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        setSubmitLoading(false);
        return;
      }

      // التحقق من تطابق كلمات المرور
      if (formData.password !== formData.password_confirm) {
        toast.error("كلمات المرور غير متطابقة");
        setSubmitLoading(false);
        return;
      }

      // تحضير البيانات للإرسال
      const createData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        university: formData.university,
      };

      // إضافة الحقول الاختيارية
      if (formData.department) {
        createData.department = formData.department;
      }
      if (formData.position) {
        createData.position = formData.position;
      }
      if (formData.license_number) {
        createData.license_number = formData.license_number;
      }

      await dispatch(createSupervisorAsync(createData)).unwrap();
      toast.success("تم إنشاء المشرف بنجاح");
      setShowForm(false);
      dispatch(fetchSupervisorsAsync());
    } catch (error) {
      toast.error(error || "فشل في إنشاء المشرف");
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
        className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
              إدارة المشرفين
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 
                dark:from-sky-500 dark:to-sky-600 dark:hover:from-sky-600 dark:hover:to-sky-700 text-white rounded-xl 
                transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={20} />
              <span className="hidden sm:inline">إضافة مشرف</span>
            </motion.button>
          </div>

          {/* Loading State */}
          {loading && supervisors.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="hidden sm:block overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
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
                    <th className="px-6 py-4 font-semibold">الجامعة</th>
                    <th className="px-6 py-4 font-semibold">القسم</th>
                    <th className="px-6 py-4 font-semibold">المنصب</th>
                    <th className="px-6 py-4 font-semibold">رقم الرخصة</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.map((s, idx) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`${
                        idx % 2 === 0
                          ? "bg-sky-50/50 dark:bg-dark-light/30"
                          : "bg-white dark:bg-dark-light"
                      } border-b border-sky-200/50 dark:border-dark-lighter hover:bg-gradient-to-r hover:from-sky-100/50 hover:to-sky-200/50 dark:hover:from-dark-lighter dark:hover:to-dark-lighter transition-all duration-300`}
                    >
                      <td className="px-6 py-4 font-medium">{s.supervisorName}</td>
                      <td className="px-6 py-4">{s.email || "-"}</td>
                      <td className="px-6 py-4">{s.university || "-"}</td>
                      <td className="px-6 py-4">{s.department || "-"}</td>
                      <td className="px-6 py-4">{s.position || "-"}</td>
                      <td className="px-6 py-4">{s.licenseNumber || "-"}</td>
                    </motion.tr>
                  ))}
                  {supervisors.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        لا توجد بيانات
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && (
            <div className="sm:hidden grid gap-4">
              {supervisors.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-5 flex flex-col gap-3 border-2 border-sky-200/50 dark:border-dark-lighter"
                >
                  <h3 className="font-bold text-lg">{s.supervisorName}</h3>
                  <p>البريد: {s.email || "-"}</p>
                  <p>الجامعة: {s.university || "-"}</p>
                  <p>القسم: {s.department || "-"}</p>
                  <p>المنصب: {s.position || "-"}</p>
                  <p>رقم الرخصة: {s.licenseNumber || "-"}</p>
                </motion.div>
              ))}
              {supervisors.length === 0 && !loading && (
                <p className="text-center py-6 text-slate-500 dark:text-slate-400">
                  لا توجد بيانات
                </p>
              )}
            </div>
          )}

          {/* Modal Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !submitLoading && setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-sky-200/50 dark:border-dark-lighter"
              >
                <div className="flex justify-between items-center p-4 sm:p-5 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-600 dark:from-sky-700 dark:via-sky-800 dark:to-sky-700 text-white">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    إضافة مشرف جديد
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowForm(false)}
                    disabled={submitLoading}
                    className="p-2 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 disabled:opacity-50"
                  >
                    <X size={20} className="text-white" />
                  </motion.button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-h-[80vh] overflow-y-auto"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      اسم المستخدم *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      كلمة المرور *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      تأكيد كلمة المرور *
                    </label>
                    <input
                      type="password"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      الاسم الأول *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      اسم العائلة *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      الجامعة (UUID) *
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      required
                      disabled
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl 
                        bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      القسم
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      المنصب
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      رقم الرخصة
                    </label>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                        bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 col-span-1 sm:col-span-2 justify-end mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowForm(false)}
                      disabled={submitLoading}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                        dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
                    >
                      إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={submitLoading}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                        dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white rounded-xl 
                        flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 
                        disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
                    >
                      {submitLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      حفظ
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default function SupervisorsManagementPage() {
  return (
    <RoleGuard allowedRoles={["university_admin"]}>
      <SupervisorsManagementContent />
    </RoleGuard>
  );
}



