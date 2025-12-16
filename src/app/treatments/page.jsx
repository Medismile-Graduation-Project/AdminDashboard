"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  addTreatment,
  updateTreatment,
  deleteTreatment,
} from "../../redux/features/treatments/treatmentsSlice";

export default function TreatmentsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const treatments = useSelector((state) => state.treatments);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [showForm, setShowForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    doctor: "",
    cost: "",
    description: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // فتح نموذج إضافة جديد
  const handleAdd = () => {
    setEditingTreatment(null);
    setFormData({
      name: "",
      type: "",
      doctor: "",
      cost: "",
      description: "",
    });
    setShowForm(true);
  };

  // تعديل علاج
  const handleEdit = (treatment) => {
    setEditingTreatment(treatment);
    setFormData({ ...treatment });
    setShowForm(true);
  };

  // حذف علاج مع تأكيد
  const handleDelete = (id) => {
    if (confirm(t("Treatments.confirmDelete"))) {
      dispatch(deleteTreatment(id));
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTreatment) {
      dispatch(updateTreatment({ ...formData, id: editingTreatment.id }));
    } else {
      dispatch(addTreatment({ ...formData, id: Date.now() }));
    }
    setShowForm(false);
  };

  const filteredTreatments = treatments.filter((t) =>
    [t.name, t.type, t.doctor, t.cost].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!mounted) {
    return <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900"></div>;
  }

  const isRtl = i18n?.language === "ar";

  return (
    <div className={`p-4 sm:p-6 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
      <div className="max-w-[1100px] mx-auto">
        {/* 🔍 البحث + إضافة */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <input
            type="text"
            placeholder={t("Treatments.search")}
            className="px-3 py-2 border border-sky-200 dark:border-slate-700 rounded-md w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition"
          >
            <PlusCircle size={20} />
            {t("Treatments.add")}
          </button>
        </div>

        {/* 📋 جدول العلاجات أو كروت للموبايل */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-900 dark:text-slate-200 hidden sm:table">
            <thead className="bg-gradient-to-r from-blue-900 to-blue-600 dark:from-slate-800 dark:to-slate-700 text-white">
              <tr>
                <th className="px-4 py-2">{t("Treatments.name")}</th>
                <th className="px-4 py-2">{t("Treatments.type")}</th>
                <th className="px-4 py-2">{t("Treatments.doctor")}</th>
                <th className="px-4 py-2">{t("Treatments.cost")}</th>
                <th className="px-4 py-2">{t("Treatments.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.length > 0 ? (
                filteredTreatments.map((treatment) => (
                  <tr key={treatment.id} className="border-b border-sky-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700/50 transition cursor-pointer">
                    <td className="px-4 py-2">{treatment.name}</td>
                    <td className="px-4 py-2">{treatment.type}</td>
                    <td className="px-4 py-2">{treatment.doctor}</td>
                    <td className="px-4 py-2">{treatment.cost}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(treatment)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                        title={t("Treatments.edit")}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(treatment.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition"
                        title={t("Treatments.delete")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    {t("Treatments.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 🌟 Cards view للموبايل <sm */}
          <div className="sm:hidden flex flex-col gap-4">
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 flex flex-col gap-2 border border-sky-200 dark:border-slate-700"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{treatment.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(treatment)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(treatment.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p>{t("Treatments.type")}: {treatment.type}</p>
                  <p>{t("Treatments.doctor")}: {treatment.doctor}</p>
                  <p>{t("Treatments.cost")}: {treatment.cost}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400">{t("Treatments.empty")}</p>
            )}
          </div>
        </div>

      {showForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-sky-200 dark:border-slate-700">
      
      {/* العنوان */}
      <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-sky-200 to-blue-900 dark:from-slate-700 dark:to-slate-800 text-white">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          {editingTreatment ? t("Treatments.editTitle") : t("Treatments.addTitle")}
        </h2>
        <button
          onClick={() => setShowForm(false)}
          className="p-1 rounded-full hover:bg-blue-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* الفورم */}
      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
      >
        <input
          type="text"
          name="name"
          placeholder={t("Treatments.name")}
          value={formData.name}
          onChange={handleChange}
          required
          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
        />
        <input
          type="text"
          name="type"
          placeholder={t("Treatments.type")}
          value={formData.type}
          onChange={handleChange}
          required
          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
        />
        <input
          type="text"
          name="doctor"
          placeholder={t("Treatments.doctor")}
          value={formData.doctor}
          onChange={handleChange}
          required
          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
        />
        <input
          type="text"
          name="cost"
          placeholder={t("Treatments.costPlaceholder")}
          value={formData.cost}
          onChange={handleChange}
          required
          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition"
        />
        <textarea
          name="description"
          placeholder={t("Treatments.description")}
          value={formData.description}
          onChange={handleChange}
          className="p-2 sm:p-3 border border-sky-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition col-span-1 sm:col-span-2"
        />

        {/* الأزرار */}
        <div className="flex flex-col sm:flex-row gap-3 col-span-1 sm:col-span-2 justify-end">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="p-2 sm:p-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 transition"
          >
            {t("Treatments.cancel")}
          </button>
          <button
            type="submit"
            className="p-2 sm:p-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 transition"
          >
            <Save size={16} />
            {editingTreatment ? t("Treatments.update") : t("Treatments.save")}
          </button>
        </div>
      </form>
    </div>
  </div>
        )}
      </div>
    </div>
  );
}
