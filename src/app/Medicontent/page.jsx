"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { RefreshCw, Plus, Edit, Trash2, Eye } from "lucide-react";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import {
  fetchCommunityContentAsync,
  createCommunityContentAsync,
  updateCommunityContentAsync,
  deleteCommunityContentAsync,
  setFilters,
  clearFilters,
} from "../../redux/features/mediContent/mediContentSlice";

export default function MedicalContentPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  useEffect(() => setMounted(true), []);

  // جلب بيانات المستخدم
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  // جلب المحتوى من API عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchCommunityContentAsync({}));
  }, [dispatch]);

  // جلب البيانات من Redux
  const content = useSelector((state) => state.mediContent?.content || []);
  const loading = useSelector((state) => state.mediContent?.loading || false);
  const error = useSelector((state) => state.mediContent?.error || null);
  const filters = useSelector((state) => state.mediContent?.filters || {});

  // استخراج الفئات الفريدة من المحتوى
  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    content.forEach((item) => {
      if (item.category) {
        uniqueCategories.add(item.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [content]);

  // فورم إنشاء محتوى جديد
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    content_type: "article",
    category: "medical",
    url: "",
    is_public: true,
    tags: "",
  });

  const isRtl = i18n.language === "ar";

  // دالة إنشاء محتوى جديد
  const handleCreateContent = async () => {
    if (!newContent.title.trim() || !newContent.description.trim()) {
      alert(t("errors.fillRequiredFields") || "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await dispatch(createCommunityContentAsync(newContent)).unwrap();
      setNewContent({
        title: "",
        description: "",
        content_type: "article",
        category: "medical",
        url: "",
        is_public: true,
        tags: "",
      });
      setShowCreateForm(false);
      // إعادة جلب المحتوى
      dispatch(fetchCommunityContentAsync({}));
    } catch (err) {
      alert(err || t("errors.createFailed") || "فشل في إنشاء المحتوى");
    }
  };

  // دالة حذف محتوى
  const handleDeleteContent = async (id) => {
    if (!confirm(t("confirmations.delete") || "هل أنت متأكد من حذف هذا المحتوى؟")) {
      return;
    }

    try {
      await dispatch(deleteCommunityContentAsync(id)).unwrap();
      // إعادة جلب المحتوى
      dispatch(fetchCommunityContentAsync({}));
    } catch (err) {
      alert(err || t("errors.deleteFailed") || "فشل في حذف المحتوى");
    }
  };

  // دالة تحديث المحتوى
  const handleUpdateContent = async () => {
    if (!editingContent || !editingContent.title.trim() || !editingContent.description.trim()) {
      alert(t("errors.fillRequiredFields") || "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await dispatch(
        updateCommunityContentAsync({
          id: editingContent.id,
          data: editingContent,
        })
      ).unwrap();
      setEditingContent(null);
      // إعادة جلب المحتوى
      dispatch(fetchCommunityContentAsync({}));
    } catch (err) {
      alert(err || t("errors.updateFailed") || "فشل في تحديث المحتوى");
    }
  };

  // دالة فلترة المحتوى
  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(fetchCommunityContentAsync({ ...filters, [key]: value }));
  };

  // فلترة المحتوى حسب الفلاتر
  const filteredContent = useMemo(() => {
    let filtered = content;

    if (filters.type) {
      filtered = filtered.filter((item) => item.content_type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    return filtered;
  }, [content, filters]);

  if (!mounted) {
    return (
      <div className="p-6 min-h-screen bg-sky-50 dark:bg-slate-900">
        <div className="text-slate-500 dark:text-slate-400">
          {t("loading") || "جاري التحميل..."}
        </div>
      </div>
    );
  }

  return (
    <AnimatedWrapper>
      <div
        className={`p-4 sm:p-6 space-y-6 min-h-screen text-slate-900 dark:text-slate-200 ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {/* العنوان */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-white">
            {t("titles.contentManagement") || "إدارة المحتوى"}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(fetchCommunityContentAsync({}))}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {t("actions.refresh") || "تحديث"}
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition"
            >
              <Plus size={16} />
              {t("actions.addContent") || "إضافة محتوى"}
            </button>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* حالة التحميل */}
        {loading && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-center">
            {t("loading") || "جاري التحميل..."}
          </div>
        )}

        {/* فورم إنشاء محتوى جديد */}
        {showCreateForm && (
          <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-4 space-y-4 border border-sky-200 dark:border-slate-700">
            <h2 className="font-semibold text-lg text-blue-900 dark:text-white">
              {t("titles.addContent") || "إضافة محتوى جديد"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder={t("placeholders.title") || "العنوان *"}
                className="border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newContent.content_type}
                onChange={(e) => setNewContent({ ...newContent, content_type: e.target.value })}
                className="border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="article">{t("types.article") || "مقال"}</option>
                <option value="video">{t("types.video") || "فيديو"}</option>
                <option value="document">{t("types.document") || "وثيقة"}</option>
                <option value="image">{t("types.image") || "صورة"}</option>
                <option value="link">{t("types.link") || "رابط"}</option>
              </select>
              <select
                value={newContent.category}
                onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
                className="border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="medical">{t("categories.medical") || "طبي"}</option>
                <option value="educational">{t("categories.educational") || "تعليمي"}</option>
                <option value="research">{t("categories.research") || "بحثي"}</option>
                <option value="news">{t("categories.news") || "أخبار"}</option>
                <option value="general">{t("categories.general") || "عام"}</option>
              </select>
              <input
                type="url"
                value={newContent.url}
                onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                placeholder={t("placeholders.url") || "الرابط (اختياري)"}
                className="border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              value={newContent.description}
              onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
              placeholder={t("placeholders.description") || "الوصف *"}
              rows={4}
              className="w-full border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={newContent.is_public}
                  onChange={(e) => setNewContent({ ...newContent, is_public: e.target.checked })}
                  className="rounded"
                />
                {t("access.public") || "عام"}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateContent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition"
              >
                {t("actions.create") || "إنشاء"}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewContent({
                    title: "",
                    description: "",
                    content_type: "article",
                    category: "medical",
                    url: "",
                    is_public: true,
                    tags: "",
                  });
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white rounded-lg transition"
              >
                {t("actions.cancel") || "إلغاء"}
              </button>
            </div>
          </div>
        )}

        {/* الفلاتر */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-4 border border-sky-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={filters.type || ""}
              onChange={(e) => handleFilterChange("type", e.target.value || null)}
              className="border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("filters.allTypes") || "جميع الأنواع"}</option>
              <option value="article">{t("types.article") || "مقال"}</option>
              <option value="video">{t("types.video") || "فيديو"}</option>
              <option value="document">{t("types.document") || "وثيقة"}</option>
              <option value="image">{t("types.image") || "صورة"}</option>
              <option value="link">{t("types.link") || "رابط"}</option>
            </select>
            <select
              value={filters.category || ""}
              onChange={(e) => handleFilterChange("category", e.target.value || null)}
              className="border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("filters.allCategories") || "جميع الفئات"}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`categories.${cat}`, cat)}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                dispatch(clearFilters());
                dispatch(fetchCommunityContentAsync({}));
              }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white rounded-lg transition text-sm"
            >
              {t("actions.clearFilters") || "مسح الفلاتر"}
            </button>
          </div>
        </div>

        {/* عرض المحتوى */}
        {filteredContent.length === 0 && !loading ? (
          <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {t("messages.noContent") || "لا يوجد محتوى متاح"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 shadow rounded-xl p-4 border border-sky-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-blue-900 dark:text-white flex-1">
                    {item.title || "-"}
                  </h3>
                  {item.status === "pending" && (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                      {t("status.pending") || "قيد المراجعة"}
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {t("status.approved") || "موافق عليه"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {item.description || "-"}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span>{t(`types.${item.content_type}`, item.content_type)}</span>
                  <span>{t(`categories.${item.category}`, item.category)}</span>
                </div>
                <div className="flex gap-2">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition"
                    >
                      <Eye size={14} />
                      {t("actions.view") || "عرض"}
                    </a>
                  )}
                  <button
                    onClick={() => setEditingContent(item)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white rounded-lg transition"
                  >
                    <Edit size={14} />
                    {t("actions.edit") || "تعديل"}
                  </button>
                  <button
                    onClick={() => handleDeleteContent(item.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition"
                  >
                    <Trash2 size={14} />
                    {t("actions.delete") || "حذف"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* نافذة تعديل المحتوى */}
        {editingContent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sky-200 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-white">
                {t("titles.editContent") || "تعديل المحتوى"}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingContent.title || ""}
                  onChange={(e) =>
                    setEditingContent({ ...editingContent, title: e.target.value })
                  }
                  placeholder={t("placeholders.title") || "العنوان"}
                  className="w-full border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={editingContent.description || ""}
                  onChange={(e) =>
                    setEditingContent({ ...editingContent, description: e.target.value })
                  }
                  placeholder={t("placeholders.description") || "الوصف"}
                  rows={4}
                  className="w-full border border-sky-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateContent}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition"
                  >
                    {t("actions.save") || "حفظ"}
                  </button>
                  <button
                    onClick={() => setEditingContent(null)}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white rounded-lg transition"
                  >
                    {t("actions.cancel") || "إلغاء"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedWrapper>
  );
}
