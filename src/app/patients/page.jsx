"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  clearError,
} from "../../redux/features/patients/patientsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";

export default function PatientsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { patients, loading, error } = useSelector((state) => state.patients);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    // حقول إنشاء حساب جديد
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    // حقول معلومات إضافية (للتحديث)
    phone_number: "",
    address: "",
    date_of_birth: "",
    gender: "",
    medical_history: "",
    allergies: "",
    medications: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    // حقول للتوافق مع الواجهة
    name: "",
    age: "",
    phone: "",
    condition: "",
    image: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // CRUD
  const handleAdd = () => {
    setEditingPatient(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      address: "",
      date_of_birth: "",
      gender: "",
      medical_history: "",
      allergies: "",
      medications: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      name: "",
      age: "",
      phone: "",
      condition: "",
      image: "",
    });
    setShowForm(true);
    dispatch(clearError());
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      username: patient.username || "",
      email: patient.email || "",
      first_name: patient.first_name || patient.name?.split(" ")[0] || "",
      last_name: patient.last_name || patient.name?.split(" ").slice(1).join(" ") || "",
      phone_number: patient.phone_number || patient.phone || "",
      address: patient.address || "",
      date_of_birth: patient.date_of_birth || "",
      gender: patient.gender || "",
      medical_history: patient.medical_history || patient.condition || "",
      allergies: patient.allergies || "",
      medications: patient.medications || "",
      emergency_contact_name: patient.emergency_contact_name || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
      name: patient.name || "",
      age: patient.age || "",
      phone: patient.phone || patient.phone_number || "",
      condition: patient.condition || patient.medical_history || "",
      image: patient.image || "",
    });
    setShowForm(true);
    dispatch(clearError());
  };

  const handleDelete = async (userId) => {
    if (window.confirm(t("Patients.confirmDelete") || "هل أنت متأكد من حذف هذا المريض؟")) {
      try {
        await dispatch(deletePatient(userId)).unwrap();
        // إعادة جلب القائمة بعد الحذف الناجح
        dispatch(fetchPatients());
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || t("Patients.deleteError") || "فشل في حذف المريض";
        alert(errorMessage);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    dispatch(clearError());

    try {
      if (editingPatient) {
        // تحديث مريض موجود
        await dispatch(
          updatePatient({
            userId: editingPatient.user_id || editingPatient.id,
            ...formData,
          })
        ).unwrap();
      } else {
        // إنشاء مريض جديد
        await dispatch(createPatient(formData)).unwrap();
      }
      setShowForm(false);
      // إعادة جلب القائمة بعد النجاح
      dispatch(fetchPatients());
    } catch (error) {
      // الخطأ سيظهر في error state
      const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء حفظ البيانات";
      alert(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  // تأكد من أن patients هو array
  const patientsArray = Array.isArray(patients) ? patients : [];

  const filteredPatients = patientsArray.filter((p) => {
    if (!p) return false;
    const searchFields = [
      p.name || "",
      p.first_name || "",
      p.last_name || "",
      p.username || "",
      p.phone || p.phone_number || "",
      p.condition || p.medical_history || "",
      p.email || "",
    ]
      .filter(Boolean)
      .map(field => field.toLowerCase());
    
    const searchLower = searchTerm.toLowerCase();
    const matches = searchFields.some((field) => field.includes(searchLower));
    
    if (searchTerm === "" || matches) {
      return true;
    }
    return false;
  });

  console.log("✅ Filtered patients:", filteredPatients.length);

  if (!mounted)
    return <div className="p-4 sm:p-6 min-h-screen bg-sky-50"></div>;

  const isRtl = i18n?.language === "ar";

  return (
    <AnimatedWrapper>
    <div className={`p-4 sm:p-6 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
      <div className="max-w-[1300px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1
            suppressHydrationWarning
            className="text-2xl sm:text-3xl font-extrabold text-blue-900 dark:text-white"
          >
            {t("Patients.title")}
          </h1>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder={t("Patients.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
            />
            <button
              onClick={handleAdd}
                className="flex items-center justify-center p-2 sm:p-3 rounded-xl shadow bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              aria-label={t("Patients.addButton")}
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-600 dark:border-red-500 rounded-xl text-red-600 dark:text-red-400">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <strong className="block mb-1">خطأ:</strong>
                  <p className="text-sm">
                    {typeof error === "string" 
                      ? error 
                      : error?.message
                      ? error.message
                      : error?.detail
                      ? error.detail
                      : JSON.stringify(error)
                    }
                  </p>
                </div>
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-600 hover:underline shrink-0"
                >
                  {t("ClinicalCases.closeError") || "إغلاق"}
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && patientsArray.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-slate-700 dark:text-slate-300">جاري تحميل البيانات...</span>
            </div>
          )}

        {/* Table */}
          {!loading && (
        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-sky-200 dark:border-slate-700 shadow-lg">
          <table className="w-full text-sm text-slate-900 dark:text-slate-200 min-w-[900px]">
            <thead className="bg-gradient-to-r from-blue-900 to-blue-600 dark:from-slate-800 dark:to-slate-700 text-white">
              <tr>
                <th className="px-4 py-3">{t("Patients.image")}</th>
                <th className="px-4 py-3">{t("Patients.name")}</th>
                <th className="px-4 py-3">{t("Patients.age")}</th>
                <th className="px-4 py-3">{t("Patients.dateOfBirth") || "تاريخ الميلاد"}</th>
                <th className="px-4 py-3">{t("Patients.dateOfBirth") || "تاريخ الميلاد"}</th>
                <th className="px-4 py-3">{t("Patients.gender")}</th>
                <th className="px-4 py-3">{t("Patients.phone")}</th>
                <th className="px-4 py-3">{t("Patients.condition")}</th>
                <th className="px-4 py-3 text-center">{t("Patients.actions")}</th>
              </tr>
            </thead>
            <tbody>
                  {filteredPatients && filteredPatients.length > 0 ? (
                    filteredPatients.map((p, idx) => {
                      if (!p) return null;
                      const patientId = p.id || p.user_id || `patient-${idx}`;
                      return (
                      <tr
                        key={patientId}
                        className={`border-b transition ${
                          idx % 2 === 0
                            ? "bg-sky-50 dark:bg-slate-800/50"
                            : "bg-white dark:bg-slate-800"
                    } hover:bg-gradient-to-r hover:from-sky-200/30 hover:to-blue-600/30 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50`}
                >
                  <td className="px-4 py-3">
                    {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name || p.username}
                              className="w-12 h-12 rounded-full border border-sky-200"
                            />
                          ) : (
                            <span className="text-sm text-slate-500">
                              {t("Patients.noImage")}
                            </span>
                    )}
                  </td>
                        <td className="px-4 py-3">
                          {p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.username || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {p.age ||
                            (p.date_of_birth
                              ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()
                              : "-")}
                        </td>
                        <td className="px-4 py-3">
                          {p.date_of_birth 
                            ? new Date(p.date_of_birth).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {p.date_of_birth
                            ? new Date(p.date_of_birth).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
                            : "-"}
                        </td>
                        <td className="px-4 py-3">{p.gender || "-"}</td>
                        <td className="px-4 py-3">{p.phone || p.phone_number || "-"}</td>
                        <td className="px-4 py-3">
                          {p.condition || p.medical_history || "-"}
                        </td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-900 text-white transition"
                      aria-label={t("Patients.edit")}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                            onClick={() => handleDelete(p.user_id || p.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                      aria-label={t("Patients.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                      </tr>
                      );
                    }).filter(Boolean) // إزالة null values
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-6 text-slate-500 dark:text-slate-400"
                      >
                        {patientsArray.length === 0 
                          ? (loading ? "جاري التحميل..." : t("Patients.noPatients"))
                          : "لا توجد نتائج مطابقة للبحث"}
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
          )}

        {/* Cards for small screens */}
          {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
          {filteredPatients && filteredPatients.length > 0 ? (
            filteredPatients.filter(p => p !== null && p !== undefined).map((p) => {
              if (!p) return null;
              const patientId = p.id || p.user_id || Math.random();
              return (
                <article
                  key={patientId}
                  className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4 border border-sky-200 dark:border-slate-700"
                >
              {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name || p.username}
                      className="w-20 h-20 rounded-full mx-auto mb-3 border border-sky-200"
                    />
                  ) : (
                    <span className="text-sm text-slate-500 block text-center mb-3">
                      {t("Patients.noImage")}
                    </span>
                  )}
                  <h3 className="font-semibold text-center text-slate-900 dark:text-white">
                    {p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.username || "-"}
                  </h3>
                  <div className="mt-3 text-sm space-y-1 text-slate-700 dark:text-slate-300">
                    <p>
                      {t("Patients.age")}:{" "}
                      {p.age ||
                        (p.date_of_birth
                          ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()
                          : "-")}
                    </p>
                    <p>
                      {t("Patients.dateOfBirth") || "تاريخ الميلاد"}:{" "}
                      {p.date_of_birth
                        ? new Date(p.date_of_birth).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
                        : "-"}
                    </p>
                    <p>
                      {t("Patients.gender")}: {p.gender || "-"}
                    </p>
                    <p>
                      {t("Patients.phone")}: {p.phone || p.phone_number || "-"}
                    </p>
                    <p>
                      {t("Patients.condition")}: {p.condition || p.medical_history || "-"}
                    </p>
                  </div>
              <div className="flex gap-2 justify-center mt-3">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-900 text-white transition"
                >
                  <Pencil size={16} />
                </button>
                <button
                      onClick={() => handleDelete(p.user_id || p.id)}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
              );
            }).filter(Boolean)
          ) : (
            <div className="col-span-2 text-center py-10 text-slate-500 dark:text-slate-400">
              {patientsArray.length === 0 
                ? t("Patients.noPatients")
                : "لا توجد نتائج مطابقة للبحث"}
            </div>
          )}
        </div>
          )}

        {/* Modal Form */}
        {showForm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden my-auto border border-sky-200 dark:border-slate-700">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-sky-200 to-blue-900 dark:from-slate-700 dark:to-slate-800 text-white">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                    {editingPatient
                      ? t("Patients.editTitle") || "تعديل مريض"
                      : t("Patients.addTitle") || "إضافة مريض جديد"}
                </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1 rounded-full hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                  >
                  <X size={20} />
                </button>
              </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[70vh] overflow-y-auto"
                >
                  {!editingPatient && (
                    <>
                      {/* حقول إنشاء حساب جديد */}
                      <div className="sm:col-span-2">
                        <h3 className="font-bold text-slate-900 mb-2 border-b pb-2">
                          {t("Patients.accountInfo") || "معلومات الحساب"}
                        </h3>
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder={t("Patients.username") || "اسم المستخدم"}
                        required
                        className="p-2 sm:p-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t("Patients.email") || "البريد الإلكتروني"}
                        required
                        className="p-2 sm:p-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition"
                      />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t("Patients.password") || "كلمة المرور"}
                        required
                        className="p-2 sm:p-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition"
                      />
                      <input
                        type="password"
                        name="password_confirm"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        placeholder={t("Patients.passwordConfirm") || "تأكيد كلمة المرور"}
                        required
                        className="p-2 sm:p-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition"
                      />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder={t("Patients.firstName") || "الاسم الأول"}
                        required
                        className="p-2 sm:p-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition"
                      />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder={t("Patients.lastName") || "اسم العائلة"}
                        required
                        className="p-2 sm:p-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition"
                      />
                    </>
                  )}

                  {/* حقول المعلومات الإضافية */}
                  <div className="sm:col-span-2 mt-2">
                    <h3 className="font-bold text-blue-900 dark:text-white mb-2 border-b border-sky-200 dark:border-slate-700 pb-2">
                      {t("Patients.additionalInfo") || "معلومات إضافية"}
                    </h3>
                  </div>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number || formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone_number: e.target.value,
                        phone: e.target.value,
                      })
                    }
                    placeholder={t("Patients.phone") || "رقم الهاتف"}
                    className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t("Patients.address") || "العنوان"}
                    className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                  />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    placeholder={t("Patients.dateOfBirth") || "تاريخ الميلاد"}
                    className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                  >
                    <option value="">{t("Patients.selectGender") || "اختر الجنس"}</option>
                    <option value="male">{t("Patients.male") || "ذكر"}</option>
                    <option value="female">{t("Patients.female") || "أنثى"}</option>
                  </select>
                  <textarea
                    name="medical_history"
                    value={formData.medical_history || formData.condition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medical_history: e.target.value,
                        condition: e.target.value,
                      })
                    }
                    placeholder={t("Patients.medicalHistory") || "التاريخ الطبي"}
                    rows={2}
                    className="p-2 sm:p-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] bg-[var(--color-card-bg)] text-[var(--color-text-dark)] transition sm:col-span-2"
                  />
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder={t("Patients.allergies") || "الحساسيات"}
                    rows={2}
                    className="p-2 sm:p-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] bg-[var(--color-card-bg)] text-[var(--color-text-dark)] transition sm:col-span-2"
                  />
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder={t("Patients.medications") || "الأدوية"}
                    rows={2}
                    className="p-2 sm:p-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] bg-[var(--color-card-bg)] text-[var(--color-text-dark)] transition sm:col-span-2"
                  />
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    placeholder={t("Patients.emergencyContactName") || "اسم جهة الاتصال للطوارئ"}
                    className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                  />
                  <input
                    type="text"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    placeholder={t("Patients.emergencyContactPhone") || "رقم جهة الاتصال للطوارئ"}
                    className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
                  />

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 col-span-1 sm:col-span-2 justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="p-2 sm:p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition"
                    >
                      {t("Patients.cancel") || "إلغاء"}
                  </button>
                    <button
                      type="submit"
                      disabled={submitLoading || loading}
                      className="p-2 sm:p-3 bg-green-600 text-white rounded-xl flex items-center gap-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitLoading || loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                    <Save size={16} />
                      )}
                      {editingPatient
                        ? t("Patients.update") || "تحديث"
                        : t("Patients.save") || "حفظ"}
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
