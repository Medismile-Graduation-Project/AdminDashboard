"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Calendar, User, FileText, Clock, AlertCircle, UserPlus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRtl } from "@/hooks/useRtl";
import { useDispatch } from "react-redux";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import { fetchCaseById, fetchCaseHistory, fetchCaseSessions } from "@/services/casesApi";
import { fetchSupervisors } from "@/services/supervisorsApi";
import { 
  assignSupervisorToCaseAsync,
} from "@/redux/features/clinicalCases/clinicalCasesSlice";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * صفحة تفاصيل الحالة السريرية
 * قراءة فقط لمسؤول الجامعة
 */
export default function CaseDetailsPage() {
  return (
    <RoleGuard>
      <CaseDetailsContent />
    </RoleGuard>
  );
}

function CaseDetailsContent() {
  const { t } = useTranslation();
  const isRtl = useRtl();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id;
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [assigningSupervisor, setAssigningSupervisor] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [caseHistory, setCaseHistory] = useState([]);
  const [caseSessions, setCaseSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    if (caseId) {
      loadCaseDetails();
      loadSupervisors();
      loadCaseHistory();
      loadCaseSessions();
    }
  }, [caseId]);

  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCaseById(caseId);
      
      // معالجة الاستجابة حسب التوثيق
      // الصيغة المتوقعة: {status: "success", data: {...}}
      if (response?.data) {
        setCaseData(response.data);
      } else if (response?.id) {
        // إذا كانت الاستجابة مباشرة كـ Case object
        setCaseData(response);
      } else {
        setCaseData(response);
      }
    } catch (err) {
      console.error("Error loading case details:", err);
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.detail ||
        err?.message ||
        "فشل في جلب تفاصيل الحالة";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadSupervisors = async () => {
    try {
      setLoadingSupervisors(true);
      const data = await fetchSupervisors();
      setSupervisors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading supervisors:", err);
      toast.error("فشل في جلب قائمة المشرفين");
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const loadCaseHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await fetchCaseHistory(caseId);
      setCaseHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error("Error loading case history:", err);
      setCaseHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadCaseSessions = async () => {
    try {
      setLoadingSessions(true);
      const sessions = await fetchCaseSessions(caseId);
      setCaseSessions(Array.isArray(sessions) ? sessions : []);
    } catch (err) {
      console.error("Error loading case sessions:", err);
      setCaseSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleAssignSupervisor = async () => {
    if (!selectedSupervisorId) {
      toast.error("يرجى اختيار مشرف");
      return;
    }

    try {
      setAssigningSupervisor(true);
      const result = await dispatch(
        assignSupervisorToCaseAsync({ caseId, supervisorId: selectedSupervisorId })
      ).unwrap();
      
      // تحديث بيانات الحالة
      if (result.case) {
        setCaseData(result.case);
      } else {
        // إعادة تحميل التفاصيل
        await loadCaseDetails();
      }
      
      setShowAssignModal(false);
      setSelectedSupervisorId("");
      toast.success("تم تعيين المشرف بنجاح");
      // إعادة تحميل التاريخ
      await loadCaseHistory();
    } catch (err) {
      console.error("Error assigning supervisor:", err);
      const errorMessage = 
        err || 
        "فشل في تعيين المشرف";
      toast.error(errorMessage);
    } finally {
      setAssigningSupervisor(false);
    }
  };


  const getStatusBadge = (status) => {
    const statusMap = {
      new: { label: "جديدة", color: "bg-blue-500" },
      accepted: { label: "مقبولة", color: "bg-green-500" },
      rejected: { label: "مرفوضة", color: "bg-red-500" },
      needs_assignment_approval: { label: "تحتاج موافقة إسناد", color: "bg-yellow-500" },
      assigned: { label: "مسندة", color: "bg-purple-500" },
      in_progress: { label: "قيد التنفيذ", color: "bg-indigo-500" },
      completed: { label: "مكتملة", color: "bg-emerald-500" },
      closed: { label: "مغلقة", color: "bg-gray-500" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "bg-gray-500" };
    return (
      <span className={`px-3 py-1 rounded-full text-sm text-white ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };


  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { label: "منخفضة", color: "bg-green-500" },
      medium: { label: "متوسطة", color: "bg-yellow-500" },
      high: { label: "عالية", color: "bg-orange-500" },
      urgent: { label: "عاجلة", color: "bg-red-500" },
    };
    const priorityInfo = priorityMap[priority] || { label: priority, color: "bg-gray-500" };
    return (
      <span className={`px-3 py-1 rounded-full text-sm text-white ${priorityInfo.color}`}>
        {priorityInfo.label}
      </span>
    );
  };

  const getUserName = (user) => {
    if (!user) return "-";
    if (typeof user === "string") return user;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.username) return user.username;
    if (user.email) return user.email;
    return "-";
  };

  if (loading) {
    return (
      <AnimatedWrapper>
        <div className={`p-6 ${isRtl ? "text-right" : "text-left"}`}>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-sky-500" size={32} />
          </div>
        </div>
      </AnimatedWrapper>
    );
  }

  if (error) {
    return (
      <AnimatedWrapper>
        <div className={`p-6 ${isRtl ? "text-right" : "text-left"}`}>
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4 text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </AnimatedWrapper>
    );
  }

  if (!caseData) {
    return (
      <AnimatedWrapper>
        <div className={`p-6 ${isRtl ? "text-right" : "text-left"}`}>
          <p className="text-slate-500 dark:text-slate-400">الحالة غير موجودة</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </AnimatedWrapper>
    );
  }

  return (
    <AnimatedWrapper>
      <div className={`p-6 space-y-6 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>العودة</span>
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {caseData.title || "بدون عنوان"}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {getStatusBadge(caseData.status)}
                {getPriorityBadge(caseData.priority)}
                {caseData.is_public && (
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    عامة
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={20} />
                الوصف
              </h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {caseData.description || "لا يوجد وصف"}
              </p>
            </div>

            {/* History */}
            {(caseHistory.length > 0 || (caseData.history && caseData.history.length > 0)) && (
              <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={20} />
                  سجل الحالة
                  {loadingHistory && <Loader2 className="animate-spin ml-2" size={16} />}
                </h2>
                <div className="space-y-3">
                  {(caseHistory.length > 0 ? caseHistory : (caseData.history || [])).map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="border-l-4 border-sky-500 pl-4 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {entry.description || entry.action || "إجراء"}
                        </p>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {entry.created_at
                            ? new Date(entry.created_at).toLocaleDateString("ar-SA", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </div>
                      {entry.performed_by && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          بواسطة: {getUserName(entry.performed_by)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <User size={20} />
                معلومات المريض
              </h2>
              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-medium">الاسم:</span> {getUserName(caseData.patient)}
                </p>
                {caseData.patient?.email && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium">البريد:</span> {caseData.patient.email}
                  </p>
                )}
              </div>
            </div>

            {/* Student Info */}
            {caseData.student && (
              <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                  الطالب المسند
                </h2>
                <div className="space-y-2">
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium">الاسم:</span> {getUserName(caseData.student)}
                  </p>
                  {caseData.student?.email && (
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">البريد:</span> {caseData.student.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Supervisor Info */}
            <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  المشرف
                </h2>
                {!caseData.supervisor && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-3 py-1.5 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
                    disabled={assigningSupervisor || loadingSupervisors}
                  >
                    <UserPlus size={16} />
                    <span>تعيين مشرف</span>
                  </button>
                )}
              </div>
              {caseData.supervisor ? (
                <div className="space-y-2">
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium">الاسم:</span> {getUserName(caseData.supervisor)}
                  </p>
                  {caseData.supervisor?.email && (
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">البريد:</span> {caseData.supervisor.email}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  لم يتم تعيين مشرف بعد
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={20} />
                التواريخ
              </h2>
              <div className="space-y-2">
                {caseData.created_at && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium">تاريخ الإنشاء:</span>
                    <br />
                    {new Date(caseData.created_at).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                {caseData.updated_at && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium">آخر تحديث:</span>
                    <br />
                    {new Date(caseData.updated_at).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Assignment Requests */}
            {caseData.assignment_requests && caseData.assignment_requests.length > 0 && (
              <div className="bg-white dark:bg-dark-light rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                  طلبات الإسناد ({caseData.assignment_requests.length})
                </h2>
                <div className="space-y-3">
                  {caseData.assignment_requests.map((request, idx) => (
                    <div
                      key={request.id || idx}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {getUserName(request.student)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === "accepted" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                          request.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {request.status === "accepted" ? "مقبول" :
                           request.status === "rejected" ? "مرفوض" :
                           "في الانتظار"}
                        </span>
                      </div>
                      {request.message && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {request.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </AnimatedWrapper>
  );
}

