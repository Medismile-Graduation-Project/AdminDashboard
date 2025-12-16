"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStudentsAsync,
  createStudentAsync,
  updateStudentAsync,
  deleteStudentAsync,
  clearError,
} from "../../redux/features/students/studentsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";

export default function StudentsmanagPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const studentsState = useSelector((state) => state.students);
  const students = studentsState?.students || [];
  const loading = studentsState?.loading || false;
  const error = studentsState?.error || null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
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
    university_id: "",
    address: "",
    phone_number: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

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
      university_id: "",
      address: "",
      phone_number: "",
    });
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    const apiData = student._apiData || {};
    setFormData({
      username: apiData.username || "",
      email: apiData.email || "",
      password: "",
      password_confirm: "",
      first_name: apiData.first_name || "",
      last_name: apiData.last_name || "",
      student_id: apiData.student_id || "",
      year_of_study: apiData.year_of_study || "",
      specialization: apiData.specialization || "",
      university_id: apiData.university || "",
      address: apiData.address || "",
      phone_number: apiData.phone_number || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmMessage = t("students.confirmDelete") || "هل أنت متأكد من حذف هذا الطالب؟";
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await dispatch(deleteStudentAsync(id)).unwrap();
      toast.success(t("students.deleteSuccess") || "تم حذف الطالب بنجاح");
      // إعادة جلب الطلاب بعد الحذف
      dispatch(fetchStudentsAsync());
    } catch (error) {
      toast.error(error || t("students.deleteError") || "فشل في حذف الطالب");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitLoading(true);
    try {
      if (!editingStudent) {
        // إنشاء طالب جديد
        // التحقق من الحقول المطلوبة
        if (!formData.username || !formData.email || !formData.password || 
            !formData.password_confirm || !formData.first_name || !formData.last_name) {
          toast.error(t("students.fillRequiredFields") || "يرجى ملء جميع الحقول المطلوبة");
          setSubmitLoading(false);
          return;
        }

        // التحقق من تطابق كلمات المرور
        if (formData.password !== formData.password_confirm) {
          toast.error(t("students.passwordMismatch") || "كلمات المرور غير متطابقة");
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
        };

        // إضافة الحقول الاختيارية
        if (formData.student_id) {
          createData.student_id = formData.student_id;
        }
        if (formData.year_of_study) {
          const yearNum = parseInt(formData.year_of_study);
          if (yearNum >= 1 && yearNum <= 5) {
            createData.year_of_study = yearNum;
          }
        }
        if (formData.specialization) {
          createData.specialization = formData.specialization;
        }
        if (formData.university_id) {
          createData.university_id = formData.university_id;
        }

        await dispatch(createStudentAsync(createData)).unwrap();
        toast.success(t("students.createSuccess") || "تم إنشاء الطالب بنجاح");
        setShowForm(false);
        // إعادة جلب الطلاب بعد الإنشاء
        dispatch(fetchStudentsAsync());
      } else {
        // تحديث طالب موجود
        const apiData = {};
        
        if (formData.student_id) {
          apiData.student_id = formData.student_id;
        }
        
        if (formData.specialization) {
          apiData.specialization = formData.specialization;
        }
        
        if (formData.year_of_study) {
          const yearNum = parseInt(formData.year_of_study);
          if (yearNum >= 1 && yearNum <= 5) {
            apiData.year_of_study = yearNum;
          }
        }
        
        if (formData.address) {
          apiData.address = formData.address;
        }

        if (formData.phone_number) {
          apiData.phone_number = formData.phone_number;
        }

        if (formData.university_id) {
          apiData.university = formData.university_id;
        }

        // الحصول على user_id من الطالب الذي يتم تعديله
        const userId = editingStudent._apiData?.user_id || editingStudent.id;

        await dispatch(updateStudentAsync({ userId, studentData: apiData })).unwrap();
        toast.success(t("students.updateSuccess") || "تم تحديث الطالب بنجاح");
        setShowForm(false);
        // إعادة جلب الطلاب بعد التحديث
        dispatch(fetchStudentsAsync());
      }
    } catch (error) {
      toast.error(error || (editingStudent ? t("students.updateError") : t("students.createError")) || "حدث خطأ");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    [
      s.studentName,
      s.studentNumber,
      s.university,
      s.year,
      s.specialty,
      s.email,
      s.address,
    ].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 dark:text-white">
              {t("students.title")}
            </h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder={t("students.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition font-medium"
              >
                <PlusCircle size={20} />
                <span className="hidden sm:inline">{t("students.addStudent")}</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && students.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}

          {/* Desktop Table */}
          {!loading && (
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-sky-200 dark:border-slate-700 shadow-lg">
              <table className="w-full text-sm text-slate-900 dark:text-slate-200 min-w-[900px]">
                <thead className="bg-gradient-to-r from-blue-900 to-blue-600 dark:from-slate-800 dark:to-slate-700 text-white">
                  <tr>
                    <th className="px-4 py-3">{t("students.name")}</th>
                    <th className="px-4 py-3">{t("students.number")}</th>
                    <th className="px-4 py-3">الجامعة</th>
                    <th className="px-4 py-3">السنة الدراسية</th>
                    <th className="px-4 py-3">{t("students.specialty")}</th>
                    <th className="px-4 py-3">البريد الإلكتروني</th>
                    <th className="px-4 py-3 text-center">
                      {t("students.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`${
                        idx % 2 === 0
                          ? "bg-sky-50 dark:bg-slate-800/50"
                          : "bg-white dark:bg-slate-800"
                      } border-b border-sky-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-sky-200/30 hover:to-blue-600/30 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50`}
                    >
                      <td className="px-4 py-3">{s.studentName}</td>
                      <td className="px-4 py-3">{s.studentNumber || "-"}</td>
                      <td className="px-4 py-3">{s.university || "-"}</td>
                      <td className="px-4 py-3">{s.year || "-"}</td>
                      <td className="px-4 py-3">{s.specialty || "-"}</td>
                      <td className="px-4 py-3">{s.email || "-"}</td>
                      <td className="px-4 py-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          disabled={loading}
                          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={loading}
                          className="p-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        {t("students.noData") || "لا توجد بيانات"}
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
              {filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 flex flex-col gap-2 border border-sky-200 dark:border-slate-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{s.studentName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("students.number")}: {s.studentNumber || "-"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        disabled={loading}
                        className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={loading}
                        className="p-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p>
                    الجامعة: {s.university || "-"}
                  </p>
                  <p>
                    السنة الدراسية: {s.year || "-"}
                  </p>
                  <p>
                    {t("students.specialty")}: {s.specialty || "-"}
                  </p>
                  <p>
                    البريد الإلكتروني: {s.email || "-"}
                  </p>
                </div>
              ))}
              {filteredStudents.length === 0 && !loading && (
                <p className="text-center py-6 text-slate-500 dark:text-slate-400">
                  {t("students.noData")}
                </p>
              )}
            </div>
          )}

          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-sky-200 to-blue-900 dark:from-slate-700 dark:to-slate-800 text-white">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {editingStudent
                      ? t("students.editStudent")
                      : t("students.addStudent")}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    disabled={submitLoading}
                    className="p-1 rounded-full hover:bg-blue-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-white transition-colors disabled:opacity-50"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[80vh] overflow-y-auto"
                >
                  {/* الحقول المطلوبة لإنشاء طالب جديد */}
                  {!editingStudent && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                          {t("students.username") || "اسم المستخدم"} *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          placeholder={t("students.username") || "اسم المستخدم"}
                          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                          {t("students.email") || "البريد الإلكتروني"} *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder={t("students.email") || "البريد الإلكتروني"}
                          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                          {t("students.password") || "كلمة المرور"} *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder={t("students.password") || "كلمة المرور"}
                          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                          {t("students.passwordConfirm") || "تأكيد كلمة المرور"} *
                        </label>
                        <input
                          type="password"
                          name="password_confirm"
                          value={formData.password_confirm}
                          onChange={handleChange}
                          required
                          placeholder={t("students.passwordConfirm") || "تأكيد كلمة المرور"}
                          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      {t("students.firstName") || "الاسم الأول"} {!editingStudent && "*"}
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required={!editingStudent}
                      placeholder={t("students.firstName") || "الاسم الأول"}
                      className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      {t("students.lastName") || "اسم العائلة"} {!editingStudent && "*"}
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required={!editingStudent}
                      placeholder={t("students.lastName") || "اسم العائلة"}
                      className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      {t("students.number")}
                    </label>
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      placeholder={t("students.number") || "الرقم الجامعي"}
                      className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      {t("students.year") || "السنة الدراسية"} (1-5)
                    </label>
                    <input
                      type="number"
                      name="year_of_study"
                      value={formData.year_of_study}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      placeholder="1-5"
                      className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      {t("students.specialty")}
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder={t("students.specialty") || "التخصص"}
                      className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                    />
                  </div>

                  {editingStudent && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                        {t("students.email") || "البريد الإلكتروني"}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      {t("students.phone") || "رقم الهاتف"}
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder={t("students.phone") || "رقم الهاتف"}
                      className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                      {t("students.address") || "العنوان"}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={t("students.address") || "العنوان"}
                      className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 col-span-1 sm:col-span-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      disabled={submitLoading}
                      className="p-2 sm:p-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 transition disabled:opacity-50"
                    >
                      {t("students.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="p-2 sm:p-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 transition disabled:opacity-50"
                    >
                      {submitLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}{" "}
                      {t("students.save")}
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
