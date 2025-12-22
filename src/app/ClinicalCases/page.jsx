"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, Loader2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchCases,
  createCase,
  updateCase,
  deleteCase,
  fetchCaseById,
  fetchAssignmentRequestsAsync,
  createAssignmentRequestAsync,
  supervisorCaseActionAsync,
  fetchCaseSessionsAsync,
  approveCaseSessionAsync,
  rejectCaseSessionAsync,
  requestCaseSessionModificationAsync,
  setSelectedCase,
  clearSelectedCase,
  clearError,
} from "../../redux/features/clinicalCases/clinicalCasesSlice";
import { fetchPatients } from "../../redux/features/patients/patientsSlice";
import { fetchStudentsAsync } from "../../redux/features/students/studentsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";
import RoleGuard from "@/components/RoleGuard";

function ClinicalCasesContent() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { cases, loading, error, selectedCase, assignmentRequests, caseSessions, loadingSessions } = useSelector((state) => state.clinicalCases);
  const { patients } = useSelector((state) => state.patients);
  const { students } = useSelector((state) => state.students);
  
  // جلب معلومات المستخدم الحالي
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);
  
  // Debug: عرض عدد الحالات
  useEffect(() => {
    console.log("📋 Current cases in state:", cases?.length || 0);
    console.log("📋 Cases data:", cases);
  }, [cases]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // جلب الحالات والبيانات المساعدة عند تحميل الصفحة
  useEffect(() => {
    // جلب معلومات المستخدم أولاً
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    
    console.log("📋 ClinicalCases Page - User:", storedUser);
    
    // بناء query parameters حسب دور المستخدم
    const fetchParams = {};
    
    // إذا كان المستخدم مشرفاً، نجلب حالاته فقط
    if (storedUser?.role === "supervisor" && storedUser?.id) {
      fetchParams.supervisor_id = storedUser.id;
      console.log("📋 Fetching cases for supervisor:", storedUser.id);
    }
    // إذا كان المستخدم مسؤول جامعة، نجلب جميع حالات جامعته (Backend يفلتر تلقائياً)
    else if (storedUser?.role === "university_admin") {
      // Backend يفلتر تلقائياً حسب university_id من request.user
      console.log("📋 Fetching cases for university admin (all university cases)");
    }
    // إذا كان المستخدم طالباً، نجلب حالاته المسندة إليه
    else if (storedUser?.role === "student" && storedUser?.id) {
      fetchParams.student_id = storedUser.id;
      console.log("📋 Fetching cases for student:", storedUser.id);
    }
    // إذا كان المستخدم مريضاً، نجلب حالاته فقط
    else if (storedUser?.role === "patient" && storedUser?.id) {
      fetchParams.patient_id = storedUser.id;
      console.log("📋 Fetching cases for patient:", storedUser.id);
    } else {
      console.log("📋 Fetching all cases (no user filter)");
    }
    
    console.log("📋 Fetch params:", fetchParams);
    
    dispatch(fetchCases(fetchParams))
      .then((result) => {
        console.log("📋 Fetch cases result:", result);
        if (result.error) {
          console.error("📋 Error fetching cases:", result.error);
        }
      })
      .catch((err) => {
        console.error("📋 Failed to fetch cases:", err);
      });
    
    dispatch(fetchPatients());
    dispatch(fetchStudentsAsync());
  }, [dispatch]);

  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    patient_id: "",
    student_id: "", // لا يرسل في create، يستخدم للإسناد اللاحق
    priority: "medium",
    is_public: false,
    status: "open",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignmentRequest, setShowAssignmentRequest] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState("");

  const handleAddCase = () => {
    setEditingCase(null);
    setFormData({
      title: "",
      description: "",
      patient_id: "",
       student_id: "",
      priority: "medium",
      is_public: false,
      status: "open",
    });
    setShowForm(true);
  };

  const handleEditCase = (c) => {
    setEditingCase(c);
    setFormData({
      title: c.title || "",
      description: c.description || "",
      patient_id: c.patient_id || "",
      student_id: c.student_id || "",
      priority: c.priority || "medium",
      is_public: c.is_public || false,
      status: c.status || "open",
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCase(null);
    setSubmitLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // مسؤول الجامعة: قراءة فقط - لا يمكنه إنشاء أو تعديل
    if (user?.role === "university_admin") {
      toast.error("مسؤول الجامعة: لا يمكنك إنشاء أو تعديل الحالات (قراءة فقط)");
      return;
    }
    
    // التحقق من البيانات المطلوبة عند الإنشاء
    if (!editingCase) {
      if (!formData.title || !formData.description) {
        toast.error("يرجى ملء جميع الحقول المطلوبة (العنوان والوصف)");
        return;
      }
      if (!formData.patient_id) {
        toast.error("يرجى اختيار المريض");
        return;
      }
    }
    
    setSubmitLoading(true);
    try {
      if (editingCase) {
        await dispatch(updateCase({ caseId: editingCase.id, ...formData })).unwrap();
        handleCloseForm();
        toast.success(t("ClinicalCases.caseUpdated") || "تم تحديث الحالة بنجاح");
        // إعادة جلب الحالات بعد التحديث
        const fetchParams = {};
        if (user?.role === "supervisor" && user?.id) {
          fetchParams.supervisor_id = user.id;
        } else if (user?.role === "university_admin") {
          // Backend يفلتر تلقائياً حسب university_id
        } else if (user?.role === "student" && user?.id) {
          fetchParams.student_id = user.id;
        } else if (user?.role === "patient" && user?.id) {
          fetchParams.patient_id = user.id;
        }
        dispatch(fetchCases(fetchParams));
      } else {
        // إنشاء الحالة
        console.log("📋 Page - Creating case with formData:", formData);
        const createdCase = await dispatch(createCase(formData)).unwrap();
        console.log("📋 Page - Created case:", createdCase);

        // إذا كان المشرف اختار طالباً، أنشئ طلب إسناد ثم قبوله
        if (user?.role === "supervisor" && formData.student_id && createdCase?.id) {
          try {
            // إنشاء طلب الإسناد
            const assignmentRequest = await dispatch(
              createAssignmentRequestAsync({
                caseId: createdCase.id,
                message: "",
                studentId: formData.student_id,
              })
            ).unwrap();

            // قبول الطلب تلقائياً
            await dispatch(
              supervisorCaseActionAsync({
                caseId: createdCase.id,
                action: "accept",
                studentId: formData.student_id,
                message: "",
                userId: user?.id || user?.user_id,
              })
            ).unwrap();
          } catch (assignErr) {
            // إذا فشل الإسناد، لا نمنع إنشاء الحالة
            console.error("Error assigning student after create:", assignErr);
            // عرض رسالة تحذيرية للمستخدم
            const errorMsg = typeof assignErr === "string" 
              ? assignErr 
              : assignErr?.response?.data?.message || assignErr?.message || "تم إنشاء الحالة لكن فشل إسناد الطالب";
            toast.error(errorMsg);
          }
        }
        
        handleCloseForm();
        toast.success(t("ClinicalCases.caseCreated") || "تم إنشاء الحالة بنجاح");
        
        // إعادة جلب الحالات بعد الإنشاء للتأكد من ظهورها
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const fetchParams = {};
        
        if (storedUser?.role === "supervisor" && storedUser?.id) {
          fetchParams.supervisor_id = storedUser.id;
        } else if (storedUser?.role === "student" && storedUser?.id) {
          fetchParams.student_id = storedUser.id;
        } else if (storedUser?.role === "patient" && storedUser?.id) {
          fetchParams.patient_id = storedUser.id;
        }
        
        console.log("📋 Page - Refreshing cases after create with params:", fetchParams);
        
        // إعادة الجلب مباشرة (بدون timeout)
        try {
          const refreshResult = await dispatch(fetchCases(fetchParams));
          console.log("📋 Page - Cases refreshed after create:", refreshResult);
          
          if (refreshResult.type === "cases/fetchCases/fulfilled") {
            console.log("📋 Page - Number of cases after refresh:", refreshResult.payload?.length || 0);
            if (refreshResult.payload && refreshResult.payload.length > 0) {
              console.log("📋 Page - Cases data:", refreshResult.payload);
            } else {
              console.warn("📋 Page - No cases found after refresh");
            }
          } else if (refreshResult.type === "cases/fetchCases/rejected") {
            console.error("📋 Page - Failed to refresh cases:", refreshResult.error);
            toast.error("تم إنشاء الحالة لكن فشل جلب القائمة. يرجى تحديث الصفحة.");
          }
        } catch (refreshErr) {
          console.error("📋 Page - Error refreshing cases:", refreshErr);
          toast.error("تم إنشاء الحالة لكن فشل جلب القائمة. يرجى تحديث الصفحة.");
        }
      }
    } catch (error) {
      console.error("Error saving case:", error);
      // عرض رسالة الخطأ للمستخدم
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || error?.toString() || "حدث خطأ أثناء حفظ الحالة";
      toast.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // مسؤول الجامعة: قراءة فقط - لا يمكنه حذف
    if (user?.role === "university_admin") {
      toast.error("مسؤول الجامعة: لا يمكنك حذف الحالات (قراءة فقط)");
      return;
    }
    
    if (confirm(t("ClinicalCases.confirmDelete"))) {
      try {
        await dispatch(deleteCase(id)).unwrap();
        toast.success(t("ClinicalCases.caseDeleted") || "تم حذف الحالة بنجاح");
        // إعادة جلب الحالات بعد الحذف
        const fetchParams = {};
        if (user?.role === "supervisor" && user?.id) {
          fetchParams.supervisor_id = user.id;
        } else if (user?.role === "student" && user?.id) {
          fetchParams.student_id = user.id;
        } else if (user?.role === "patient" && user?.id) {
          fetchParams.patient_id = user.id;
        }
        dispatch(fetchCases(fetchParams));
      } catch (error) {
        console.error("Error deleting case:", error);
        const errorMsg = typeof error === "string" 
          ? error 
          : error?.response?.data?.message || error?.message || "فشل حذف الحالة";
        toast.error(errorMsg);
      }
    }
  };

  // عرض تفاصيل الحالة
  const handleViewDetails = async (caseItem) => {
    try {
      await dispatch(fetchCaseById(caseItem.id)).unwrap();
      // جلب طلبات الإسناد - فقط للمشرف
      if (user?.role === "supervisor") {
        await dispatch(fetchAssignmentRequestsAsync(caseItem.id)).unwrap();
        // جلب جلسات الحالة - فقط للمشرف
        await dispatch(fetchCaseSessionsAsync(caseItem.id)).unwrap();
      }
      dispatch(setSelectedCase(caseItem));
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching case details:", error);
    }
  };

  // طلب إسناد (للطلاب)
  const handleRequestAssignment = async (caseId) => {
    try {
      await dispatch(createAssignmentRequestAsync({ caseId, message: assignmentMessage })).unwrap();
      toast.success(t("ClinicalCases.requestSent") || "تم إرسال طلب الإسناد بنجاح");
      setShowAssignmentRequest(false);
      setAssignmentMessage("");
      // إعادة جلب التفاصيل
      await dispatch(fetchCaseById(caseId)).unwrap();
      await dispatch(fetchAssignmentRequestsAsync(caseId)).unwrap();
    } catch (error) {
      console.error("Error requesting assignment:", error);
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || "فشل إرسال طلب الإسناد";
      toast.error(errorMsg);
    }
  };

  // إجراءات المشرف على الجلسات
  const handleApproveSession = async (caseId, sessionId) => {
    if (user?.role !== "supervisor") {
      toast.error("فقط المشرف يمكنه مراجعة الجلسات");
      return;
    }
    try {
      await dispatch(approveCaseSessionAsync({ caseId, sessionId })).unwrap();
      toast.success(t("ClinicalCases.sessionApproved") || "تمت الموافقة على الجلسة بنجاح");
      // إعادة جلب الجلسات
      await dispatch(fetchCaseSessionsAsync(caseId)).unwrap();
    } catch (error) {
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || "فشل الموافقة على الجلسة";
      toast.error(errorMsg);
    }
  };

  const handleRejectSession = async (caseId, sessionId) => {
    if (user?.role !== "supervisor") {
      toast.error("فقط المشرف يمكنه مراجعة الجلسات");
      return;
    }
    const reason = prompt(t("ClinicalCases.rejectionReason") || "يرجى إدخال سبب الرفض (اختياري):");
    try {
      await dispatch(rejectCaseSessionAsync({ caseId, sessionId, reason: reason || undefined })).unwrap();
      toast.success(t("ClinicalCases.sessionRejected") || "تم رفض الجلسة بنجاح");
      // إعادة جلب الجلسات
      await dispatch(fetchCaseSessionsAsync(caseId)).unwrap();
    } catch (error) {
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || "فشل رفض الجلسة";
      toast.error(errorMsg);
    }
  };

  const handleRequestModification = async (caseId, sessionId) => {
    if (user?.role !== "supervisor") {
      toast.error("فقط المشرف يمكنه طلب التعديل");
      return;
    }
    const feedback = prompt(t("ClinicalCases.modificationFeedback") || "يرجى إدخال ملاحظات التعديل المطلوبة:");
    if (!feedback || !feedback.trim()) {
      toast.error(t("ClinicalCases.feedbackRequired") || "ملاحظات التعديل مطلوبة");
      return;
    }
    try {
      await dispatch(requestCaseSessionModificationAsync({ caseId, sessionId, feedback: feedback.trim() })).unwrap();
      toast.success(t("ClinicalCases.modificationRequested") || "تم إرسال طلب التعديل بنجاح");
      // إعادة جلب الجلسات
      await dispatch(fetchCaseSessionsAsync(caseId)).unwrap();
    } catch (error) {
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || "فشل إرسال طلب التعديل";
      toast.error(errorMsg);
    }
  };

  // إجراء المشرف (قبول/رفض) - فقط للمشرف
  const handleSupervisorAction = async (caseId, action, studentId) => {
    // مسؤول الجامعة: قراءة فقط - لا يمكنه قبول/رفض طلبات الإسناد
    if (user?.role === "university_admin") {
      toast.error("مسؤول الجامعة: لا يمكنك قبول/رفض طلبات الإسناد (قراءة فقط)");
      return;
    }
    
    // فقط المشرف يمكنه قبول/رفض
    if (user?.role !== "supervisor") {
      toast.error("فقط المشرف يمكنه قبول/رفض طلبات الإسناد");
      return;
    }
    
    try {
      await dispatch(supervisorCaseActionAsync({
        caseId,
        action,
        studentId,
        userId: user?.id || user?.user_id,
      })).unwrap();
      
      toast.success(
        action === "accept" 
          ? t("ClinicalCases.requestAccepted") || "تم قبول طلب الإسناد بنجاح"
          : t("ClinicalCases.requestRejected") || "تم رفض طلب الإسناد"
      );
      
      // إعادة جلب التفاصيل
      await dispatch(fetchCaseById(caseId)).unwrap();
      await dispatch(fetchAssignmentRequestsAsync(caseId)).unwrap();
      
      // إعادة جلب قائمة الحالات لتحديث الحالة
      const fetchParams = {};
      if (user?.role === "supervisor" && user?.id) {
        fetchParams.supervisor_id = user.id;
      }
      dispatch(fetchCases(fetchParams));
    } catch (error) {
      console.error("Error performing supervisor action:", error);
      const errorMsg = typeof error === "string" 
        ? error 
        : error?.response?.data?.message || error?.message || "فشل تنفيذ الإجراء";
      toast.error(errorMsg);
    }
  };

  const filteredCases = useMemo(() => {
    return (cases || []).filter((c) => {
      if (!c || !c.id) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (c.title || "").toLowerCase().includes(searchLower) ||
        (c.description || "").toLowerCase().includes(searchLower) ||
        (c.patient_name || "").toLowerCase().includes(searchLower) ||
        (c.student_name || "").toLowerCase().includes(searchLower) ||
        (c.supervisor_name || "").toLowerCase().includes(searchLower) ||
        (c.status || "").toLowerCase().includes(searchLower) ||
        (c.priority || "").toLowerCase().includes(searchLower) ||
        String(c.id || "").toLowerCase().includes(searchLower)
      );
    });
  }, [cases, searchTerm]);

  // Debug: عرض عدد الحالات المفلترة
  useEffect(() => {
    console.log("📋 Filtered cases count:", filteredCases?.length || 0);
    console.log("📋 Search term:", searchTerm);
  }, [filteredCases, searchTerm]);

  if (!mounted) return <div className="p-4 sm:p-6 min-h-screen bg-sky-50"></div>;

  const isRtl = i18n?.language === "ar";

  return (
    <AnimatedWrapper>
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent">
            {t("ClinicalCases.title")}
          </h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder={t("ClinicalCases.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 sm:py-3 border-2 border-sky-200/50 dark:border-dark-lighter rounded-xl w-full sm:w-64 
                bg-white dark:bg-dark-light text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 
                focus:border-sky-500 dark:focus:border-sky-400 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            {/* زر إضافة حالة - يظهر فقط للمشرف */}
            {user?.role === "supervisor" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddCase}
                className="flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 
                  hover:from-sky-700 hover:to-sky-800 dark:from-sky-500 dark:to-sky-600 dark:hover:from-sky-600 dark:hover:to-sky-700 
                  text-white transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                aria-label={t("ClinicalCases.addNew")}
              >
                <PlusCircle size={20} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 dark:border-red-500/50 rounded-xl text-red-600 dark:text-red-400 shadow-lg">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-semibold mb-1">خطأ في جلب الحالات:</p>
                <p className="text-sm">{typeof error === "string" ? error : JSON.stringify(error)}</p>
                <p className="text-xs mt-2 opacity-75">تحقق من Console (F12) لمزيد من التفاصيل</p>
              </div>
              <button
                onClick={() => dispatch(clearError())}
                className="text-red-600 hover:text-red-500 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-sky-600 dark:text-sky-400">
            {t("ClinicalCases.loading")}
          </div>
        )}

        {/* Table for large screens */}
        {!loading && (
        <div className="hidden lg:block overflow-x-auto rounded-2xl border-2 border-sky-200/50 dark:border-dark-lighter shadow-2xl">
          <table
            className={`w-full text-sm text-dark dark:text-sky-200 min-w-[1000px] ${
              isRtl ? "text-right" : "text-left"
            }`}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <thead className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 dark:from-dark-lighter dark:via-dark-light dark:to-dark-lighter text-white">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t("ClinicalCases.table.title")}</th>
                  <th className="px-6 py-4 font-semibold">{t("ClinicalCases.table.patient")}</th>
                  <th className="px-6 py-4 font-semibold">{t("ClinicalCases.table.student")}</th>
                  <th className="px-6 py-4 font-semibold">{t("ClinicalCases.table.supervisor")}</th>
                  <th className="px-6 py-4 font-semibold">{t("ClinicalCases.table.status")}</th>
                  <th className="px-6 py-4 font-semibold">{t("ClinicalCases.table.priority")}</th>
                  <th className="px-6 py-4 font-semibold">{t("ClinicalCases.table.isPublic")}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t("ClinicalCases.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.length > 0 ? filteredCases.map((c, idx) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={`${idx % 2 === 0 ? "bg-sky-50/50 dark:bg-dark-light/30" : "bg-white dark:bg-dark-light"} 
                      border-b border-sky-200/50 dark:border-dark-lighter transition-all duration-300 
                      hover:bg-gradient-to-r hover:from-sky-100/50 hover:to-sky-200/50 dark:hover:from-dark-lighter dark:hover:to-dark-lighter`}
                  >
                    <td className="px-6 py-4 font-semibold">{c.title || "-"}</td>
                    <td className="px-6 py-4">{c.patient_name || "-"}</td>
                    <td className="px-6 py-4">{c.student_name || "-"}</td>
                    <td className="px-6 py-4">{c.supervisor_name || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        c.status === "completed" ? "bg-green-100 text-green-600" :
                        c.status === "cancelled" ? "bg-red-100 text-red-600" :
                        c.status === "in_progress" ? "bg-blue-100 text-blue-600" :
                        "bg-blue-100 text-blue-500"
                      }`}>
                        {t(`ClinicalCases.status.${c.status}`) || c.status || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        c.priority === "urgent" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                        c.priority === "high" ? "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400" :
                        c.priority === "low" ? "bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-300" :
                        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                        {t(`ClinicalCases.priority.${c.priority}`) || c.priority || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {c.is_public ? t("ClinicalCases.yes") : t("ClinicalCases.no")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                      <button onClick={() => handleViewDetails(c)} className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition" title={t("ClinicalCases.viewDetails") || "عرض التفاصيل"}><Eye size={16} /></button>
                      {/* أزرار التعديل والحذف - تظهر فقط للمشرف */}
                      {user?.role === "supervisor" && (
                        <>
                          <button onClick={() => handleEditCase(c)} className="p-2 rounded-lg bg-blue-600 hover:bg-blue-900 text-white transition" title={t("ClinicalCases.edit") || "تعديل"}><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition" title={t("ClinicalCases.delete") || "حذف"}><Trash2 size={16} /></button>
                        </>
                      )}
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-slate-500">
                      {cases.length === 0
                        ? t("ClinicalCases.noCases")
                        : t("ClinicalCases.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Cards for small/medium screens */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {filteredCases.length > 0 ? filteredCases.map((c) => (
              <article key={c.id} className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4 border border-sky-200 dark:border-slate-700">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{c.title || "-"}</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{c.description || "-"}</p>
                  </div>
                  <div className="flex gap-2">
                    {/* أزرار التعديل والحذف - تظهر فقط للمشرف */}
                    {user?.role === "supervisor" && (
                      <>
                        <button onClick={() => handleEditCase(c)} className="p-2 rounded-lg bg-blue-600 hover:bg-blue-900 text-white transition"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-sm space-y-1">
                  <div><strong>{t("ClinicalCases.table.patient")}:</strong> {c.patient_name || "-"}</div>
                  <div><strong>{t("ClinicalCases.table.student")}:</strong> {c.student_name || "-"}</div>
                  <div><strong>{t("ClinicalCases.table.supervisor")}:</strong> {c.supervisor_name || "-"}</div>
                  <div className="flex gap-2 items-center">
                    <strong>{t("ClinicalCases.table.status")}:</strong>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      c.status === "completed" ? "bg-green-100 text-green-600" :
                      c.status === "cancelled" ? "bg-red-100 text-red-600" :
                      c.status === "in_progress" ? "bg-blue-100 text-blue-600" :
                      "bg-blue-100 text-blue-500"
                    }`}>
                      {t(`ClinicalCases.status.${c.status}`) || c.status || "-"}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <strong>{t("ClinicalCases.table.priority")}:</strong>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      c.priority === "urgent" ? "bg-red-100 text-red-600" :
                      c.priority === "high" ? "bg-blue-100 text-blue-600" :
                      c.priority === "low" ? "bg-blue-100 text-blue-500" :
                      "bg-green-100 text-green-600"
                    }`}>
                      {t(`ClinicalCases.priority.${c.priority}`) || c.priority || "-"}
                    </span>
                  </div>
                  <div><strong>{t("ClinicalCases.table.isPublic")}:</strong> {c.is_public ? t("ClinicalCases.yes") : t("ClinicalCases.no")}</div>
                </div>
              </article>
            )) : (
              <div className="col-span-2 text-center py-10 text-slate-500">
                {cases.length === 0
                  ? t("ClinicalCases.noCases")
                  : t("ClinicalCases.noResults")}
              </div>
            )}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] my-4 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-sky-200 to-blue-900 dark:from-slate-700 dark:to-slate-900 text-white sticky top-0 z-10 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold">{editingCase ? t("ClinicalCases.form.editTitle") : t("ClinicalCases.form.addTitle")}</h2>
                <button onClick={handleCloseForm} className="p-1 rounded-full hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-colors"><X size={20} /></button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Title */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-slate-900 dark:text-white">
                    {t("ClinicalCases.form.title")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="p-2 border border-sky-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-slate-900 dark:text-white">
                    {t("ClinicalCases.form.description")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="p-2 border border-sky-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                    rows={4}
                    required
                  />
                </div>

                {/* Patient - مطلوب عند الإنشاء فقط */}
                {!editingCase && (
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1 text-slate-900 dark:text-white">
                      {t("ClinicalCases.table.patient")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="patient_id"
                      value={formData.patient_id}
                      onChange={handleInputChange}
                      className="p-2 border border-sky-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                      required
                    >
                      <option value="">{t("placeholders.selectPatient") || "اختر المريض"}</option>
                      {(patients || []).map((patient) => (
                        <option key={patient.id || patient.user_id} value={patient.id || patient.user_id}>
                          {patient.name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.username || patient.email || "-"}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("ClinicalCases.form.patientNote") || "ملاحظة: لا يمكن إضافة طالب أو مشرف مباشرة عند الإنشاء. يتم الإسناد لاحقاً عبر طلبات الإسناد."}
                    </p>
                  </div>
                )}

                {/* Student (اختياري - يظهر للمشرف) */}
                {user?.role === "supervisor" && (
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1 text-slate-900 dark:text-white">
                      {t("ClinicalCases.table.student")} {editingCase ? "" : <span className="text-slate-400 text-xs">({t("ClinicalCases.details.requestAssignment") || "اختياري للإسناد"})</span>}
                    </label>
                    <select
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleInputChange}
                      className="p-2 border border-sky-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                    >
                      <option value="">{t("placeholders.selectStudent") || "اختر الطالب"}</option>
                      {(students || []).map((student) => (
                        <option key={student.id || student.user_id} value={student.id || student.user_id}>
                          {student.name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || student.username || student.email || "-"}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("ClinicalCases.details.requestAssignment") || "يمكنك تعيين الطالب مباشرة بعد إنشاء الحالة، سننشئ طلب إسناد ونقبله تلقائياً."}
                    </p>
                  </div>
                )}

                {/* Status and Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1 text-slate-900 dark:text-white">
                      {t("ClinicalCases.form.status")}
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="p-2 border border-sky-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                    >
                      <option value="open">{t("ClinicalCases.status.open")}</option>
                      <option value="assigned">{t("ClinicalCases.status.assigned")}</option>
                      <option value="in_progress">{t("ClinicalCases.status.in_progress")}</option>
                      <option value="completed">{t("ClinicalCases.status.completed")}</option>
                      <option value="cancelled">{t("ClinicalCases.status.cancelled")}</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1 text-slate-900 dark:text-white">
                      {t("ClinicalCases.form.priority")}
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="p-2 border border-sky-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                    >
                      <option value="low">{t("ClinicalCases.priority.low")}</option>
                      <option value="medium">{t("ClinicalCases.priority.medium")}</option>
                      <option value="high">{t("ClinicalCases.priority.high")}</option>
                      <option value="urgent">{t("ClinicalCases.priority.urgent")}</option>
                    </select>
                  </div>
                </div>

                {/* Is Public */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-sky-200 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="font-semibold text-slate-900">
                    {t("ClinicalCases.form.isPublic")}
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-sky-200 dark:border-slate-700 mt-4 sticky bottom-0 bg-white dark:bg-slate-800 pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={submitLoading}
                    className="p-2 sm:p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition disabled:opacity-50"
                  >
                    {t("ClinicalCases.form.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="p-2 sm:p-3 bg-green-600 text-white rounded-xl flex items-center gap-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition disabled:opacity-50"
                  >
                    {submitLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {editingCase
                      ? t("ClinicalCases.form.update")
                      : t("ClinicalCases.form.save")}
                  </button>
                </div>
              </form>


            </div>
          </div>
        )}

        {/* Modal Details - عرض التفاصيل مع History و Assignment Requests */}
        {showDetails && selectedCase && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-sky-200 to-blue-900 dark:from-slate-700 dark:to-slate-900 text-white sticky top-0 z-10">
                <h2 className="text-xl font-bold">{selectedCase.title || t("ClinicalCases.details.title")}</h2>
                <button onClick={() => { setShowDetails(false); dispatch(clearSelectedCase()); }} className="p-1 rounded-full hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* معلومات الحالة */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("ClinicalCases.table.patient")}</h3>
                    <p className="text-slate-900 dark:text-white">{selectedCase.patient_name || "-"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("ClinicalCases.table.student")}</h3>
                    <p className="text-slate-900 dark:text-white">{selectedCase.student_name || "-"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("ClinicalCases.table.supervisor")}</h3>
                    <p className="text-slate-900 dark:text-white">{selectedCase.supervisor_name || "-"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("ClinicalCases.table.status")}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedCase.status === "completed" ? "bg-green-100 text-green-600" :
                      selectedCase.status === "cancelled" ? "bg-red-100 text-red-600" :
                      selectedCase.status === "in_progress" ? "bg-blue-100 text-blue-600" :
                      "bg-blue-100 text-blue-500"
                    }`}>
                      {t(`ClinicalCases.status.${selectedCase.status}`) || selectedCase.status}
                    </span>
                  </div>
                </div>

                {/* الوصف */}
                <div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("ClinicalCases.form.description")}</h3>
                  <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">{selectedCase.description || "-"}</p>
                </div>

                {/* طلبات الإسناد - تظهر فقط للمشرف والطالب */}
                {(user?.role === "supervisor" || user?.role === "student") && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300">{t("ClinicalCases.details.assignmentRequests") || "طلبات الإسناد"}</h3>
                      {user?.role === "student" && selectedCase.status === "open" && (
                        <button
                          onClick={() => setShowAssignmentRequest(true)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                        >
                          {t("ClinicalCases.details.requestAssignment") || "طلب إسناد"}
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(selectedCase.assignment_requests || assignmentRequests[selectedCase.id] || []).length > 0 ? (
                        (selectedCase.assignment_requests || assignmentRequests[selectedCase.id] || []).map((request) => (
                          <div key={request.id} className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {request.student?.first_name && request.student?.last_name
                                    ? `${request.student.first_name} ${request.student.last_name}`
                                    : request.student?.username || request.student?.email || "-"}
                                </p>
                                {request.message && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{request.message}</p>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                  {request.created_at ? new Date(request.created_at).toLocaleString("ar-SA") : "-"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  request.status === "accepted" ? "bg-green-100 text-green-600" :
                                  request.status === "rejected" ? "bg-red-100 text-red-600" :
                                  "bg-yellow-100 text-yellow-600"
                                }`}>
                                  {request.status === "accepted" ? t("ClinicalCases.requestStatus.accepted") || "مقبول" :
                                   request.status === "rejected" ? t("ClinicalCases.requestStatus.rejected") || "مرفوض" :
                                   t("ClinicalCases.requestStatus.pending") || "قيد الانتظار"}
                                </span>
                                {/* أزرار قبول/رفض - فقط للمشرف */}
                                {user?.role === "supervisor" && request.status === "pending" && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleSupervisorAction(selectedCase.id, "accept", request.student?.id || request.student)}
                                    className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition"
                                    title={t("ClinicalCases.accept") || "قبول"}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleSupervisorAction(selectedCase.id, "reject", request.student?.id || request.student)}
                                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
                                    title={t("ClinicalCases.reject") || "رفض"}
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-4">{t("ClinicalCases.details.noAssignmentRequests") || "لا توجد طلبات إسناد"}</p>
                    )}
                  </div>
                </div>

                {/* جلسات الحالة - تظهر فقط للمشرف */}
                {user?.role === "supervisor" && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                        {t("ClinicalCases.details.sessions") || "جلسات الحالة"}
                      </h3>
                    </div>
                    {loadingSessions ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="animate-spin text-blue-500" size={24} />
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {(caseSessions[selectedCase.id] || []).length > 0 ? (
                          (caseSessions[selectedCase.id] || []).map((session) => (
                            <div
                              key={session.id}
                              className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900 dark:text-white">
                                    {session.title || t("ClinicalCases.details.sessionTitle") || "جلسة"}
                                  </p>
                                  {session.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                      {session.description}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    {session.session_date && (
                                      <span>
                                        {t("ClinicalCases.details.sessionDate") || "التاريخ"}:{" "}
                                        {new Date(session.session_date).toLocaleDateString("ar-SA")}
                                      </span>
                                    )}
                                    {session.student && (
                                      <span>
                                        {t("ClinicalCases.details.student") || "الطالب"}:{" "}
                                        {session.student?.first_name} {session.student?.last_name}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        session.status === "approved"
                                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                          : session.status === "rejected"
                                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                          : session.status === "pending_modification"
                                          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                      }`}
                                    >
                                      {session.status === "approved"
                                        ? t("ClinicalCases.sessionStatus.approved") || "موافق عليها"
                                        : session.status === "rejected"
                                        ? t("ClinicalCases.sessionStatus.rejected") || "مرفوضة"
                                        : session.status === "pending_modification"
                                        ? t("ClinicalCases.sessionStatus.pendingModification") || "في انتظار التعديل"
                                        : t("ClinicalCases.sessionStatus.pending") || "قيد المراجعة"}
                                    </span>
                                  </div>
                                  {session.supervisor_feedback && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                      <strong>{t("ClinicalCases.details.feedback") || "ملاحظات المشرف"}:</strong>{" "}
                                      {session.supervisor_feedback}
                                    </p>
                                  )}
                                </div>
                                {/* أزرار إجراءات المشرف - فقط للجلسات المعلقة */}
                                {session.status === "pending" && (
                                  <div className="flex flex-col gap-2 ml-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleApproveSession(selectedCase.id, session.id)}
                                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-xs"
                                      title={t("ClinicalCases.approveSession") || "موافقة"}
                                    >
                                      <CheckCircle size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleRejectSession(selectedCase.id, session.id)}
                                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-xs"
                                      title={t("ClinicalCases.rejectSession") || "رفض"}
                                    >
                                      <XCircle size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleRequestModification(selectedCase.id, session.id)}
                                      className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition text-xs"
                                      title={t("ClinicalCases.requestModification") || "طلب تعديل"}
                                    >
                                      <Pencil size={16} />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                            {t("ClinicalCases.details.noSessions") || "لا توجد جلسات لهذه الحالة"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* سجل الحالة (History) */}
                <div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">{t("ClinicalCases.details.history") || "سجل الحالة"}</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(selectedCase.history || []).length > 0 ? (
                      selectedCase.history.map((historyItem, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg border-r-4 border-blue-500">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {t(`ClinicalCases.history.${historyItem.action}`) || historyItem.action}
                              </p>
                              {historyItem.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{historyItem.description}</p>
                              )}
                              {historyItem.performed_by && (
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                  {t("ClinicalCases.details.performedBy") || "من قبل:"} {
                                    typeof historyItem.performed_by === "object"
                                      ? historyItem.performed_by.username || historyItem.performed_by.email || "-"
                                      : historyItem.performed_by
                                  }
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {historyItem.created_at ? new Date(historyItem.created_at).toLocaleString("ar-SA") : "-"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-4">{t("ClinicalCases.details.noHistory") || "لا يوجد سجل"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal طلب الإسناد */}
        {showAssignmentRequest && selectedCase && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-sky-200 to-blue-900 dark:from-slate-700 dark:to-slate-900 text-white">
                <h2 className="text-lg font-bold">{t("ClinicalCases.details.requestAssignment") || "طلب إسناد"}</h2>
                <button onClick={() => { setShowAssignmentRequest(false); setAssignmentMessage(""); }} className="p-1 rounded-full hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block font-semibold mb-2 text-slate-900 dark:text-white">
                    {t("ClinicalCases.details.message") || "الرسالة (اختياري)"}
                  </label>
                  <textarea
                    value={assignmentMessage}
                    onChange={(e) => setAssignmentMessage(e.target.value)}
                    className="w-full p-2 border border-sky-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                    rows={4}
                    placeholder={t("ClinicalCases.details.messagePlaceholder") || "اكتب رسالتك هنا..."}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setShowAssignmentRequest(false); setAssignmentMessage(""); }}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                  >
                    {t("ClinicalCases.form.cancel")}
                  </button>
                  <button
                    onClick={() => handleRequestAssignment(selectedCase.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                  >
                    {t("ClinicalCases.details.submitRequest") || "إرسال الطلب"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AnimatedWrapper>
  );
}

export default function ClinicalCasesPage() {
  // داشبورد مشتركة للمشرف ومسؤول الجامعة مع فصل الصلاحيات داخل الصفحة
  return (
    <RoleGuard allowedRoles={["supervisor", "university_admin", "student", "patient"]}>
      <ClinicalCasesContent />
    </RoleGuard>
  );
}
