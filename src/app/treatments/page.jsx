"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
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
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
            {t("Treatments.title") || "العلاجات"}
          </h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder={t("Treatments.search")}
              className="px-4 py-2.5 sm:py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl w-full sm:w-64 
                focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 
                bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-all duration-300 shadow-sm hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-sky-600 to-sky-700 
                hover:from-sky-700 hover:to-sky-800 dark:from-sky-500 dark:to-sky-600 dark:hover:from-sky-600 dark:hover:to-sky-700 
                text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={20} />
              <span className="hidden sm:inline">{t("Treatments.add")}</span>
            </motion.button>
          </div>
        </div>

        {/* 📋 جدول العلاجات أو كروت للموبايل */}
        <div className="hidden sm:block overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
          <table className="w-full text-sm text-slate-900 dark:text-slate-200">
            <thead className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 dark:from-dark-lighter dark:via-dark-light dark:to-dark-lighter text-white">
              <tr>
                <th className="px-6 py-4 font-semibold text-left">{t("Treatments.name")}</th>
                <th className="px-6 py-4 font-semibold text-left">{t("Treatments.type")}</th>
                <th className="px-6 py-4 font-semibold text-left">{t("Treatments.doctor")}</th>
                <th className="px-6 py-4 font-semibold text-left">{t("Treatments.cost")}</th>
                <th className="px-6 py-4 font-semibold text-center">{t("Treatments.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.length > 0 ? (
                filteredTreatments.map((treatment, idx) => (
                  <motion.tr
                    key={treatment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={`border-b border-sky-200/50 dark:border-dark-lighter transition-all duration-300 ${
                      idx % 2 === 0 ? "bg-sky-50/50 dark:bg-dark-light/30" : "bg-white dark:bg-dark-light"
                    } hover:bg-gradient-to-r hover:from-sky-100/50 hover:to-sky-200/50 dark:hover:from-dark-lighter dark:hover:to-dark-lighter`}
                  >
                    <td className="px-6 py-4 font-medium">{treatment.name}</td>
                    <td className="px-6 py-4">{treatment.type}</td>
                    <td className="px-6 py-4">{treatment.doctor}</td>
                    <td className="px-6 py-4">{treatment.cost}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(treatment)}
                          className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 
                            dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white 
                            focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 shadow-md hover:shadow-lg"
                          title={t("Treatments.edit")}
                        >
                          <Pencil size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(treatment.id)}
                          className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                            dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white 
                            focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 shadow-md hover:shadow-lg"
                          title={t("Treatments.delete")}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
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
          <div className="sm:hidden grid gap-4">
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((treatment, idx) => (
                <motion.div
                  key={treatment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white dark:bg-dark-light shadow-lg rounded-2xl p-5 flex flex-col gap-3 border-2 border-sky-200/50 dark:border-dark-lighter hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{treatment.name}</h3>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(treatment)}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white 
                          focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 shadow-md"
                      >
                        <Pencil size={16} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(treatment.id)}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white 
                          focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 shadow-md"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                  <p>{t("Treatments.type")}: {treatment.type}</p>
                  <p>{t("Treatments.doctor")}: {treatment.doctor}</p>
                  <p>{t("Treatments.cost")}: {treatment.cost}</p>
                </motion.div>
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
