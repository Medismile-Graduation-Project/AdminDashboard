"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MessageCircle, Send, HelpCircle, FileText, Clock, CheckCircle } from "lucide-react";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import { motion } from "framer-motion";

export default function SupportPage() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    category: "technical",
    priority: "medium",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  const isRtl = i18n.language === "ar";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة إرسال الطلب (يمكن ربطه بـ API لاحقاً)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        subject: "",
        category: "technical",
        priority: "medium",
        message: "",
      });
      
      // إخفاء رسالة النجاح بعد 5 ثوان
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const supportChannels = [
    {
      icon: <MessageCircle size={24} />,
      title: t("support.whatsapp") || "واتساب",
      description: t("support.whatsappDesc") || "تواصل معنا مباشرة عبر واتساب",
      contact: "+966 50 123 4567",
      link: "https://wa.me/966501234567",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: <Mail size={24} />,
      title: t("support.email") || "البريد الإلكتروني",
      description: t("support.emailDesc") || "أرسل بريد إلكتروني إلى فريق الدعم",
      contact: "support@medismile.com",
      link: "mailto:support@medismile.com",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: <Phone size={24} />,
      title: t("support.phone") || "الهاتف",
      description: t("support.phoneDesc") || "اتصل بنا مباشرة",
      contact: "+966 11 123 4567",
      link: "tel:+966111234567",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  const categories = [
    { value: "technical", label: t("support.categories.technical") || "مشكلة تقنية" },
    { value: "account", label: t("support.categories.account") || "مشكلة في الحساب" },
    { value: "feature", label: t("support.categories.feature") || "طلب ميزة جديدة" },
    { value: "bug", label: t("support.categories.bug") || "بلاغ عن خطأ" },
    { value: "other", label: t("support.categories.other") || "أخرى" },
  ];

  const priorities = [
    { value: "low", label: t("support.priorities.low") || "منخفضة", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    { value: "medium", label: t("support.priorities.medium") || "متوسطة", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { value: "high", label: t("support.priorities.high") || "عالية", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    { value: "urgent", label: t("support.priorities.urgent") || "عاجلة", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  ];

  if (!mounted) {
    return (
      <div className="p-6 min-h-screen bg-sky-50 dark:bg-slate-900">
        <div className="text-slate-500 dark:text-slate-400">{t("loading") || "جاري التحميل..."}</div>
      </div>
    );
  }

  return (
    <AnimatedWrapper>
      <div className={`p-4 sm:p-6 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 dark:text-white mb-2">
              {t("support.title") || "الدعم التقني"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {t("support.subtitle") || "نحن هنا لمساعدتك في أي وقت"}
            </p>
          </div>

          {/* قنوات التواصل */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {supportChannels.map((channel, index) => (
              <motion.a
                key={index}
                href={channel.link}
                target={channel.link.startsWith("http") ? "_blank" : undefined}
                rel={channel.link.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${channel.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
              >
                <div className="flex items-center gap-4 mb-3">
                  {channel.icon}
                  <h3 className="text-xl font-semibold">{channel.title}</h3>
                </div>
                <p className="text-white/90 mb-3 text-sm">{channel.description}</p>
                <p className="text-white font-medium">{channel.contact}</p>
              </motion.a>
            ))}
          </div>

          {/* نموذج طلب الدعم */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-sky-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="text-blue-600 dark:text-blue-400" size={28} />
              <h2 className="text-2xl font-bold text-blue-900 dark:text-white">
                {t("support.formTitle") || "إرسال طلب دعم"}
              </h2>
            </div>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3"
              >
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                <p className="text-green-700 dark:text-green-400 font-medium">
                  {t("support.successMessage") || "تم إرسال طلبك بنجاح! سنتواصل معك قريباً."}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("support.form.subject") || "الموضوع"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t("support.form.subjectPlaceholder") || "أدخل موضوع الطلب"}
                    className="w-full border border-sky-200 dark:border-slate-700 rounded-lg p-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("support.form.category") || "الفئة"} *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-sky-200 dark:border-slate-700 rounded-lg p-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t("support.form.priority") || "الأولوية"} *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.priority === priority.value
                          ? `${priority.color} border-current`
                          : "border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500"
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t("support.form.message") || "الرسالة"} *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t("support.form.messagePlaceholder") || "اكتب تفاصيل طلبك هنا..."}
                  rows={6}
                  className="w-full border border-sky-200 dark:border-slate-700 rounded-lg p-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {user && (
                <div className="p-3 rounded-lg bg-sky-50 dark:bg-slate-700/50 border border-sky-200 dark:border-slate-600">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>{t("support.form.userInfo") || "معلومات المستخدم:"}</strong>{" "}
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username || user.email}
                    {" - "}
                    {user.email}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="animate-spin" size={20} />
                    {t("support.form.sending") || "جاري الإرسال..."}
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {t("support.form.submit") || "إرسال الطلب"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* الأسئلة الشائعة */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-sky-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-blue-600 dark:text-blue-400" size={28} />
              <h2 className="text-2xl font-bold text-blue-900 dark:text-white">
                {t("support.faq.title") || "الأسئلة الشائعة"}
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: t("support.faq.q1") || "كيف يمكنني استعادة كلمة المرور؟",
                  a: t("support.faq.a1") || "يمكنك النقر على 'نسيت كلمة المرور' في صفحة تسجيل الدخول، أو التواصل مع الدعم التقني.",
                },
                {
                  q: t("support.faq.q2") || "كيف أضيف موعد جديد؟",
                  a: t("support.faq.a2") || "انتقل إلى صفحة المواعيد واضغط على 'إضافة موعد جديد' واملأ البيانات المطلوبة.",
                },
                {
                  q: t("support.faq.q3") || "كيف يمكنني تحديث بياناتي الشخصية؟",
                  a: t("support.faq.a3") || "انتقل إلى صفحة الملف الشخصي واضغط على 'تعديل' لتحديث معلوماتك.",
                },
                {
                  q: t("support.faq.q4") || "ما هي ساعات عمل الدعم؟",
                  a: t("support.faq.a4") || "نعمل على مدار الساعة طوال أيام الأسبوع. يمكنك التواصل معنا في أي وقت.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-sky-50 dark:bg-slate-700/50 border border-sky-200 dark:border-slate-600"
                >
                  <h3 className="font-semibold text-blue-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-sky-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {t("support.helpText") || "هل تحتاج مساعدة إضافية؟"}
            </p>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              {t("support.contactText") || "لا تتردد في التواصل معنا - نحن هنا لمساعدتك!"}
            </p>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
}














