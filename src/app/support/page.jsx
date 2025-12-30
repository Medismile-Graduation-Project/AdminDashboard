"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRtl } from "@/hooks/useRtl";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Phone, MessageCircle, Send, HelpCircle, FileText, Clock, CheckCircle, RefreshCw } from "lucide-react";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import { motion } from "framer-motion";
import { createTicketAsync, fetchTicketsAsync, clearError } from "@/redux/features/support/supportSlice";
import toast from "react-hot-toast";

export default function SupportPage() {
  const { t, i18n } = useTranslation();
  const isRtl = useRtl();
  const dispatch = useDispatch();
  const { loading, error: supportError, tickets } = useSelector((state) => state.support);
  
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    category: "technical",
    priority: "medium",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showTickets, setShowTickets] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (supportError) {
      setError(supportError);
      dispatch(clearError());
    }
  }, [supportError, dispatch]);

  // جلب التذاكر عند تحميل الصفحة
  useEffect(() => {
    dispatch(fetchTicketsAsync());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // التحقق من الحقول المطلوبة
    if (!formData.subject || !formData.description) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const result = await dispatch(
        createTicketAsync({
          subject: formData.subject,
          description: formData.description,
          priority: formData.priority,
          ...(formData.category && { category: formData.category }), // اختياري
        })
      ).unwrap();

      if (result) {
        toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريباً.");
        setSubmitted(true);
        setFormData({
          subject: "",
          category: "technical",
          priority: "medium",
          description: "",
        });
        
        // إعادة جلب التذاكر بعد إنشاء تذكرة جديدة
        dispatch(fetchTicketsAsync());
        
        // إخفاء رسالة النجاح بعد 5 ثوان
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      const errorMessage = err || "فشل إرسال الطلب";
      setError(errorMessage);
      toast.error(errorMessage);
    }
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
      <div className={`p-6 sm:p-8 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {t("support.title") || "الدعم التقني"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
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
                className={`${channel.color} text-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className={`flex items-center gap-3 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                  {channel.icon}
                  <h3 className="text-lg font-bold">{channel.title}</h3>
                </div>
                <p className="text-white/90 mb-3 text-sm leading-relaxed">{channel.description}</p>
                <p className="text-white font-semibold">{channel.contact}</p>
              </motion.a>
            ))}
          </div>

          {/* نموذج طلب الدعم */}
          <div className="bg-white dark:bg-dark-light rounded-xl shadow-sm p-5 sm:p-6 border border-slate-200 dark:border-slate-700">
            <div className={`flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
              <HelpCircle className="text-sky-600 dark:text-sky-400 flex-shrink-0" size={24} />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {t("support.formTitle") || "إرسال طلب دعم"}
              </h2>
            </div>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
                <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
                  {t("support.successMessage") || "تم إرسال طلبك بنجاح! سنتواصل معك قريباً."}
                </p>
              </motion.div>
            )}

            {(error || supportError) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-red-700 dark:text-red-400 font-semibold text-sm">
                  {error || supportError}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t("support.form.subject") || "الموضوع"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t("support.form.subjectPlaceholder") || "أدخل موضوع الطلب"}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t("support.form.category") || "الفئة"} *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  {t("support.form.priority") || "الأولوية"} *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 font-semibold text-sm ${
                        formData.priority === priority.value
                          ? `${priority.color} border-current shadow-sm`
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-dark text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("support.form.description") || "الوصف"} *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("support.form.descriptionPlaceholder") || "اكتب تفاصيل طلبك هنا..."}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 resize-none"
                />
              </div>

              {user && (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong className="font-semibold">{t("support.form.userInfo") || "معلومات المستخدم:"}</strong>{" "}
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username || user.email}
                    {" - "}
                    {user.email}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  {loading ? (
                    <>
                      <Clock className="animate-spin" size={18} />
                      {t("support.form.sending") || "جاري الإرسال..."}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t("support.form.submit") || "إرسال الطلب"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* قائمة طلبات الدعم */}
          <div className="bg-white dark:bg-dark-light rounded-xl shadow-sm p-5 sm:p-6 border border-slate-200 dark:border-slate-700">
            <div className={`flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                <FileText className="text-sky-600 dark:text-sky-400 flex-shrink-0" size={24} />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {t("support.tickets.title") || "طلبات الدعم"}
                </h2>
              </div>
              <button
                onClick={() => dispatch(fetchTicketsAsync())}
                className={`px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <RefreshCw size={16} />
                {t("support.tickets.refresh") || "تحديث"}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Clock className="animate-spin text-sky-600 dark:text-sky-400" size={32} />
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <div className={`flex items-start justify-between mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <h3 className="font-bold text-slate-900 dark:text-white flex-1">
                        {ticket.subject || "بدون موضوع"}
                      </h3>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                          ticket.priority === "urgent"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : ticket.priority === "high"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                            : ticket.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {ticket.priority === "urgent"
                          ? "عاجل"
                          : ticket.priority === "high"
                          ? "عالية"
                          : ticket.priority === "medium"
                          ? "متوسطة"
                          : "منخفضة"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                      {ticket.description || ticket.body || "لا يوجد وصف"}
                    </p>
                    <div className={`flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <span className="font-medium">
                        {ticket.status === "open"
                          ? "مفتوح"
                          : ticket.status === "in_progress"
                          ? "قيد المعالجة"
                          : ticket.status === "resolved"
                          ? "محلول"
                          : ticket.status === "closed"
                          ? "مغلق"
                          : ticket.status || "غير محدد"}
                      </span>
                      {ticket.created_at && (
                        <span className="font-medium">
                          {new Date(ticket.created_at).toLocaleDateString("ar-SA")}
                        </span>
                      )}
                      {ticket.category && (
                        <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-full font-semibold">
                          {ticket.category}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <FileText className="mx-auto mb-4 text-slate-400 dark:text-slate-500" size={48} />
                <p className="font-medium">{t("support.tickets.noTickets") || "لا توجد طلبات دعم"}</p>
              </div>
            )}
          </div>

          {/* الأسئلة الشائعة */}
          <div className="bg-white dark:bg-dark-light rounded-xl shadow-sm p-5 sm:p-6 border border-slate-200 dark:border-slate-700">
            <div className={`flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
              <FileText className="text-sky-600 dark:text-sky-400 flex-shrink-0" size={24} />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
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
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 mb-2 text-sm sm:text-base">
              {t("support.helpText") || "هل تحتاج مساعدة إضافية؟"}
            </p>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
              {t("support.contactText") || "لا تتردد في التواصل معنا - نحن هنا لمساعدتك!"}
            </p>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
}














