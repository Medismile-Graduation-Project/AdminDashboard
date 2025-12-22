"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Search, Check, X, Edit, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchCases,
} from "../../redux/features/clinicalCases/clinicalCasesSlice";
import {
  fetchCaseSessionsAsync,
  approveCaseSessionAsync,
  rejectCaseSessionAsync,
  requestCaseSessionModificationAsync,
  clearError,
} from "../../redux/features/clinicalCases/clinicalCasesSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import { getUser } from "@/lib/auth";
import toast from "react-hot-toast";

function SessionsContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRtl = i18n?.language === "ar";

  // Redux state
  const { cases, caseSessions, loadingSessions, error } = useSelector((state) => state.clinicalCases);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modificationComments, setModificationComments] = useState("");

  useEffect(() => {
    setUser(getUser());
  }, []);

  // جلب حالات المشرف وجلساتها
  useEffect(() => {
    if (user?.role === "supervisor" && user?.id) {
      // جلب حالات المشرف
      dispatch(fetchCases({ supervisor_id: user.id }))
        .then((result) => {
          if (result.payload && Array.isArray(result.payload)) {
            // جلب جلسات كل حالة
            result.payload.forEach((caseItem) => {
              if (caseItem.id) {
                dispatch(fetchCaseSessionsAsync(caseItem.id));
              }
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching cases:", err);
        });
    }
  }, [dispatch, user]);

  // جمع جميع الجلسات من جميع الحالات
  const allSessions = useMemo(() => {
    const sessions = [];
    Object.values(caseSessions).forEach((sessionsArray) => {
      if (Array.isArray(sessionsArray)) {
        sessionsArray.forEach((session) => {
          // إضافة معلومات الحالة للجلسة
          const caseItem = cases.find((c) => {
            return Object.keys(caseSessions).includes(c.id) && 
                   caseSessions[c.id].some((s) => s.id === session.id);
          });
          sessions.push({
            ...session,
            case_id: caseItem?.id,
            case_title: caseItem?.title,
          });
        });
      }
    });
    return sessions;
  }, [caseSessions, cases]);

  // فلترة الجلسات
  const filtered = useMemo(() => {
    if (!search) return allSessions;
    const searchLower = search.toLowerCase();
    return allSessions.filter((s) => {
      const studentName = s.student?.first_name || s.student?.last_name || s.student?.username || s.student?.email || "";
      const patientName = s.patient?.first_name || s.patient?.last_name || s.patient?.username || s.patient?.email || "";
      const caseTitle = s.case_title || "";
      const sessionTitle = s.title || "";
      const sessionId = s.id || "";
      
      return (
        studentName.toLowerCase().includes(searchLower) ||
        patientName.toLowerCase().includes(searchLower) ||
        caseTitle.toLowerCase().includes(searchLower) ||
        sessionTitle.toLowerCase().includes(searchLower) ||
        sessionId.toLowerCase().includes(searchLower)
      );
    });
  }, [allSessions, search]);

  // Helper function للحصول على اسم المستخدم
  const getUserName = (user) => {
    if (!user) return "-";
    if (typeof user === "string") return user;
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (user.username) return user.username;
    if (user.email) return user.email;
    return "-";
  };

  // Helper function للحصول على حالة الجلسة بالعربية
  const getSessionStatus = (status) => {
    const statusMap = {
      pending: "قيد المراجعة",
      approved: "معتمدة",
      rejected: "مرفوضة",
      pending_modification: "طلب تعديل",
    };
    return statusMap[status] || status || "قيد المراجعة";
  };

  // Handlers
  const handleApprove = async (session) => {
    if (!session.case_id || !session.id) {
      toast.error("معلومات الجلسة غير مكتملة");
      return;
    }
    
    if (!window.confirm("هل أنت متأكد من اعتماد هذه الجلسة؟")) {
      return;
    }

    try {
      await dispatch(
        approveCaseSessionAsync({
          caseId: session.case_id,
          sessionId: session.id,
        })
      ).unwrap();
      toast.success("تم اعتماد الجلسة بنجاح");
      // إعادة جلب الجلسات
      dispatch(fetchCaseSessionsAsync(session.case_id));
    } catch (error) {
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || "فشل اعتماد الجلسة";
      toast.error(errorMsg);
    }
  };

  const handleReject = async (session) => {
    if (!session.case_id || !session.id) {
      toast.error("معلومات الجلسة غير مكتملة");
      return;
    }
    
    const reason = prompt("يرجى إدخال سبب الرفض (اختياري):");
    if (reason === null) return; // المستخدم ألغى

    try {
      await dispatch(
        rejectCaseSessionAsync({
          caseId: session.case_id,
          sessionId: session.id,
          reason: reason || undefined,
        })
      ).unwrap();
      toast.success("تم رفض الجلسة بنجاح");
      // إعادة جلب الجلسات
      dispatch(fetchCaseSessionsAsync(session.case_id));
    } catch (error) {
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || "فشل رفض الجلسة";
      toast.error(errorMsg);
    }
  };

  const handleRequestModification = (session) => {
    setSelectedSession(session);
    setModificationComments("");
    setShowModificationModal(true);
  };

  const handleSubmitModification = async () => {
    if (!modificationComments.trim()) {
      toast.error("يرجى إدخال ملاحظات التعديل");
      return;
    }

    if (!selectedSession?.case_id || !selectedSession?.id) {
      toast.error("معلومات الجلسة غير مكتملة");
      return;
    }

    try {
      await dispatch(
        requestCaseSessionModificationAsync({
          caseId: selectedSession.case_id,
          sessionId: selectedSession.id,
          feedback: modificationComments.trim(),
        })
      ).unwrap();
      toast.success("تم إرسال طلب التعديل بنجاح");
      setShowModificationModal(false);
      setModificationComments("");
      setSelectedSession(null);
      // إعادة جلب الجلسات
      dispatch(fetchCaseSessionsAsync(selectedSession.case_id));
    } catch (error) {
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || "فشل إرسال طلب التعديل";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <AnimatedWrapper>
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("Sessions.title") || "الجلسات"}
        </h1>
      </div>
      {/* البحث والفلاتر */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute top-2 sm:top-3 right-2 sm:right-3 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            placeholder={t("Sessions.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-dark-lighter px-10 py-2 text-sm
              focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 
              focus:outline-none bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-colors"
          />
        </div>
        <select
          className="rounded-lg border border-slate-200 dark:border-dark-lighter px-4 py-2 text-sm
            focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 
            focus:outline-none bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-colors"
        >
          <option>{t("Sessions.filterStatus")}</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 dark:border-dark-lighter px-4 py-2 text-sm
            focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 
            focus:outline-none bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-colors"
        >
          <option>{t("Sessions.filterStudent")}</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 dark:border-dark-lighter px-4 py-2 text-sm
            focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 
            focus:outline-none bg-white dark:bg-dark-light text-slate-900 dark:text-white transition-colors"
        >
          <option>{t("Sessions.filterPatient")}</option>
        </select>
      </div>

      {/* Loading State */}
      {loadingSessions && allSessions.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 dark:border-red-500/50 text-red-700 dark:text-red-400 shadow-lg">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loadingSessions && allSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            لا توجد جلسات متاحة
          </p>
        </div>
      )}

      {/* الجلسات */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filtered.map((session, idx) => {
            const statusText = getSessionStatus(session.status);
            const isApproved = session.status === "approved";
            const isRejected = session.status === "rejected";
            const isPendingModification = session.status === "pending_modification";
            const isPending = session.status === "pending";
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-lg border border-slate-200 dark:border-dark-lighter p-6 flex flex-col gap-4 
                  bg-white dark:bg-dark-light transition-colors hover:bg-slate-50 dark:hover:bg-dark-lighter"
              >
                {/* العنوان + الحالة */}
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span
                    className={`px-2 py-0.5 sm:px-3 sm:py-1 font-medium rounded-full text-white ${
                      isApproved
                        ? "bg-green-500"
                        : isRejected
                        ? "bg-red-500"
                        : isPendingModification
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {statusText}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {session.id?.substring(0, 8) || "-"}
                  </span>
                </div>

                {/* عنوان الجلسة */}
                {session.title && (
                  <p className="text-slate-900 dark:text-white font-semibold text-sm">
                    {session.title}
                  </p>
                )}

                {/* الحالة المرتبطة */}
                {session.case_title && (
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    الحالة: {session.case_title}
                  </p>
                )}

                {/* الطالب + المريض */}
                <div className="space-y-1">
                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                    {t("Sessions.student") || "الطالب"}: {getUserName(session.student)}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                    {t("Sessions.patient") || "المريض"}: {getUserName(session.patient)}
                  </p>
                </div>

                {/* الوصف */}
                {session.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
                    {session.description}
                  </p>
                )}

                {/* تاريخ الجلسة */}
                {session.session_date && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(session.session_date).toLocaleDateString("ar-SA")}
                  </p>
                )}

                {/* ملاحظات المشرف */}
                {session.supervisor_feedback && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">ملاحظات المشرف:</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">{session.supervisor_feedback}</p>
                  </div>
                )}

                {/* الأزرار - للمشرف فقط */}
                {user?.role === "supervisor" && isPending && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-dark-lighter">
                    <button
                      onClick={() => handleApprove(session)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm 
                        bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
                    >
                      <Check size={14} />
                      <span>اعتماد</span>
                    </button>
                    <button
                      onClick={() => handleRequestModification(session)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm 
                        bg-orange-500 hover:bg-orange-600 text-white transition-colors font-medium"
                    >
                      <Edit size={14} />
                      <span>طلب تعديل</span>
                    </button>
                    <button
                      onClick={() => handleReject(session)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm 
                        bg-red-600 hover:bg-red-700 text-white transition-colors font-medium"
                    >
                      <X size={14} />
                      <span>رفض</span>
                    </button>
                  </div>
                )}

                {/* حالة الجلسة المعتمدة أو المرفوضة */}
                {(isApproved || isRejected) && (
                  <div className={`flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-dark-lighter ${
                    isApproved ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {isApproved ? (
                      <Check size={16} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <X size={16} className="text-red-600 dark:text-red-400" />
                    )}
                    <span className="text-sm font-medium">{statusText}</span>
                  </div>
                )}

                {/* ملاحظات التعديل */}
                {isPendingModification && session.supervisor_feedback && (
                  <div className="pt-2 border-t border-slate-200 dark:border-dark-lighter">
                    <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <MessageSquare size={14} className="text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-orange-800 dark:text-orange-300 mb-1">طلب تعديل:</p>
                        <p className="text-xs text-orange-700 dark:text-orange-400">{session.supervisor_feedback}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal طلب التعديل */}
      <AnimatePresence>
        {showModificationModal && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white dark:bg-dark-light rounded-lg p-6 w-full max-w-md ${isRtl ? "text-right" : "text-left"}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  طلب تعديل الجلسة
                </h2>
                <button
                  onClick={() => setShowModificationModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-dark-lighter rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  الجلسة: {selectedSession.id}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  الحالة: {selectedSession.case_title || "-"}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  الطالب: {getUserName(selectedSession.student)} - المريض: {getUserName(selectedSession.patient)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  ملاحظات التعديل *
                </label>
                <textarea
                  value={modificationComments}
                  onChange={(e) => setModificationComments(e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-lighter
                    bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none 
                    focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                    ${isRtl ? "text-right" : "text-left"}`}
                  placeholder="أدخل ملاحظاتك حول التعديلات المطلوبة..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowModificationModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-dark-lighter rounded-lg 
                    hover:bg-slate-50 dark:hover:bg-dark-lighter transition-colors text-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmitModification}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg 
                    transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  إرسال طلب التعديل
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AnimatedWrapper>
  );
}

export default function SessionsPage() {
  // صفحة الجلسات متاحة فقط للمشرف
  return (
    <RoleGuard allowedRoles={["supervisor"]}>
      <SessionsContent />
    </RoleGuard>
  );
}
