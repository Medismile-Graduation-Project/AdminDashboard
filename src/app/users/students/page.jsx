"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, Loader2, Search } from "lucide-react";
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
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import toast from "react-hot-toast";
import { useRtl } from "@/hooks/useRtl";

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

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // جلب الطلاب عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchStudentsAsync());
  }, [dispatch]);

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
      university: user?.university_id || user?.university || "",
      address: "",
      phone_number: "",
    });
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username || "",
      email: student.email || "",
      password: "",
      password_confirm: "",
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      student_id: student.student_id || "",
      year_of_study: student.year_of_study || "",
      specialization: student.specialization || "",
      university: student.university || user?.university_id || user?.university || "",
      address: student.address || "",
      phone_number: student.phone_number || "",
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
      if (editingStudent) {
        await dispatch(
          updateStudentAsync({ id: editingStudent.user_id || editingStudent.id, data: formData })
        ).unwrap();
        toast.success("تم تحديث الطالب بنجاح");
      } else {
        await dispatch(createStudentAsync(formData)).unwrap();
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
    const searchLower = searchTerm.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(searchLower) ||
      student.last_name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.student_id?.toString().includes(searchLower)
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
              إدارة الطلاب
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              إدارة حسابات الطلاب في الجامعة
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            إضافة طالب جديد
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="ابحث عن طالب..."
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
              setEditingStudent(null);
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
                    {editingStudent ? "تعديل طالب" : "إضافة طالب جديد"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingStudent(null);
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
                    {!editingStudent && (
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
                            required={!editingStudent}
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
                            required={!editingStudent}
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
                        رقم الطالب
                      </label>
                      <input
                        type="text"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        السنة الدراسية
                      </label>
                      <input
                        type="number"
                        name="year_of_study"
                        value={formData.year_of_study}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        التخصص
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        رقم الهاتف
                      </label>
                      <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        العنوان
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
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
                        setEditingStudent(null);
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

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-sky-600" size={32} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد طلاب"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <motion.div
                key={student.user_id || student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white dark:bg-dark-light rounded-lg shadow border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{student.email}</p>
                    {student.student_id && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        رقم الطالب: {student.student_id}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(student.user_id || student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {student.specialization && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    التخصص: {student.specialization}
                  </p>
                )}
                {student.year_of_study && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    السنة: {student.year_of_study}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedWrapper>
  );
}


