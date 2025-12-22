"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, Loader2, Users, UserCheck, UserX, BookOpen, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSubjectsAsync,
  createSubjectAsync,
  updateSubjectAsync,
  deleteSubjectAsync,
  assignSupervisorAsync,
  removeSupervisorAsync,
  enrollStudentAsync,
  unenrollStudentAsync,
  clearError,
} from "../../redux/features/subjects/subjectsSlice";
import { fetchStudentsAsync } from "../../redux/features/students/studentsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import toast from "react-hot-toast";

export default function SubjectsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRtl = i18n?.language === "ar";

  // Redux states
  const subjectsState = useSelector((state) => state.subjects);
  const subjects = subjectsState?.subjects || [];
  const loading = subjectsState?.loading || false;
  const error = subjectsState?.error || null;

  const studentsState = useSelector((state) => state.students);
  const students = studentsState?.students || [];

  // Local states
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignType, setAssignType] = useState(null); // 'supervisor' or 'student'
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    university_id: "",
  });

  // Get user info
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
    if (storedUser?.university_id) {
      setFormData(prev => ({ ...prev, university_id: storedUser.university_id }));
    }
  }, []);

  // Fetch subjects and students on mount
  useEffect(() => {
    dispatch(fetchSubjectsAsync());
    dispatch(fetchStudentsAsync());
  }, [dispatch]);

  // Show error messages (لكن نتجاهل 404 لأن API غير موجود بعد)
  useEffect(() => {
    if (error && !error.includes("404")) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Filter subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) =>
      [s.name, s.code, s.description].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [subjects, searchTerm]);

  // Handle add new subject
  const handleAdd = () => {
    setSelectedSubject(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      university_id: user?.university_id || "",
    });
    setShowForm(true);
  };

  // Handle edit subject
  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name || "",
      code: subject.code || "",
      description: subject.description || "",
      university_id: subject.university_id || user?.university_id || "",
    });
    setShowForm(true);
  };

  // Handle delete subject
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المادة الدراسية؟")) {
      return;
    }

    try {
      await dispatch(deleteSubjectAsync(id)).unwrap();
      toast.success("تم حذف المادة الدراسية بنجاح");
      dispatch(fetchSubjectsAsync());
    } catch (error) {
      toast.error(error || "فشل في حذف المادة الدراسية");
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (!formData.name || !formData.code) {
        toast.error("يرجى إدخال اسم المادة والكود");
        setSubmitLoading(false);
        return;
      }

      if (selectedSubject) {
        // Update
        await dispatch(
          updateSubjectAsync({
            subjectId: selectedSubject.id,
            subjectData: {
              name: formData.name,
              code: formData.code,
              description: formData.description || "",
              university_id: formData.university_id || user?.university_id,
            },
          })
        ).unwrap();
        toast.success("تم تحديث المادة الدراسية بنجاح");
      } else {
        // Create
        await dispatch(
          createSubjectAsync({
            name: formData.name,
            code: formData.code,
            description: formData.description || "",
            university_id: formData.university_id || user?.university_id,
          })
        ).unwrap();
        toast.success("تم إنشاء المادة الدراسية بنجاح");
      }

      setShowForm(false);
      dispatch(fetchSubjectsAsync());
    } catch (error) {
      toast.error(error || "حدث خطأ");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle assign supervisor/student
  const handleOpenAssignModal = (subject, type) => {
    setSelectedSubject(subject);
    setAssignType(type);
    setShowAssignModal(true);
  };

  // Handle assign supervisor
  const handleAssignSupervisor = async (supervisorId) => {
    try {
      await dispatch(
        assignSupervisorAsync({
          subjectId: selectedSubject.id,
          supervisorId,
        })
      ).unwrap();
      toast.success("تم تعيين المشرف بنجاح");
      setShowAssignModal(false);
      dispatch(fetchSubjectsAsync());
    } catch (error) {
      toast.error(error || "فشل في تعيين المشرف");
    }
  };

  // Handle remove supervisor
  const handleRemoveSupervisor = async (supervisorId) => {
    if (!window.confirm("هل أنت متأكد من إزالة هذا المشرف؟")) {
      return;
    }

    try {
      await dispatch(
        removeSupervisorAsync({
          subjectId: selectedSubject.id,
          supervisorId,
        })
      ).unwrap();
      toast.success("تم إزالة المشرف بنجاح");
      dispatch(fetchSubjectsAsync());
    } catch (error) {
      toast.error(error || "فشل في إزالة المشرف");
    }
  };

  // Handle enroll student
  const handleEnrollStudent = async (studentId) => {
    try {
      await dispatch(
        enrollStudentAsync({
          subjectId: selectedSubject.id,
          studentId,
        })
      ).unwrap();
      toast.success("تم تسجيل الطالب بنجاح");
      setShowAssignModal(false);
      dispatch(fetchSubjectsAsync());
    } catch (error) {
      toast.error(error || "فشل في تسجيل الطالب");
    }
  };

  // Handle unenroll student
  const handleUnenrollStudent = async (studentId) => {
    if (!window.confirm("هل أنت متأكد من إلغاء تسجيل هذا الطالب؟")) {
      return;
    }

    try {
      await dispatch(
        unenrollStudentAsync({
          subjectId: selectedSubject.id,
          studentId,
        })
      ).unwrap();
      toast.success("تم إلغاء تسجيل الطالب بنجاح");
      dispatch(fetchSubjectsAsync());
    } catch (error) {
      toast.error(error || "فشل في إلغاء تسجيل الطالب");
    }
  };

  // Get available supervisors (mock - يجب استبداله بـ API call)
  const getAvailableSupervisors = () => {
    // TODO: جلب المشرفين من API
    // حالياً نستخدم قائمة افتراضية
    return [];
  };

  // Get available students for enrollment
  const getAvailableStudents = (subject) => {
    const enrolledIds = (subject.students || []).map((s) => s.id || s.user_id);
    return students.filter((s) => !enrolledIds.includes(s.id));
  };

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-slate-50 dark:bg-dark"></div>
    );
  }

  return (
    <AnimatedWrapper>
      <div className={`p-4 md:p-6 min-h-screen ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              إدارة المواد الدراسية
            </h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className={`absolute top-3 ${isRtl ? "right-3" : "left-3"} text-slate-400`} size={18} />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-dark-lighter
                    bg-white dark:bg-dark-light text-slate-900 dark:text-white focus:outline-none 
                    focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors`}
                />
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 
                  text-white rounded-lg transition-colors font-medium whitespace-nowrap"
              >
                <PlusCircle size={20} />
                <span className="hidden sm:inline">إضافة مادة</span>
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && subjects.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-sky-600" size={32} />
            </div>
          )}

          {/* Subjects Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-light rounded-lg border border-slate-200 dark:border-dark-lighter p-6"
                >
                  {/* Subject Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subject.code}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-dark-lighter rounded-lg transition-colors"
                      >
                        <Pencil size={18} className="text-sky-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-dark-lighter rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {subject.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      {subject.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Users size={16} />
                      <span>{subject.students?.length || 0} طالب</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <UserCheck size={16} />
                      <span>{subject.supervisors?.length || 0} مشرف</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-dark-lighter">
                    <button
                      onClick={() => handleOpenAssignModal(subject, "supervisor")}
                      className="flex-1 px-3 py-2 text-sm bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 
                        rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
                    >
                      تعيين مشرف
                    </button>
                    <button
                      onClick={() => handleOpenAssignModal(subject, "student")}
                      className="flex-1 px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 
                        rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      تسجيل طالب
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredSubjects.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? "لا توجد نتائج" : "لا توجد مواد دراسية"}
              </p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-dark-light rounded-lg p-6 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {selectedSubject ? "تعديل مادة" : "إضافة مادة جديدة"}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-dark-lighter rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      اسم المادة *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-lighter
                        bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      كود المادة *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-lighter
                        bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      الوصف
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-lighter
                        bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none 
                        focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-dark-lighter rounded-lg 
                        hover:bg-slate-50 dark:hover:bg-dark-lighter transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg 
                        transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {selectedSubject ? "حفظ التعديلات" : "إنشاء"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assign Modal */}
        <AnimatePresence>
          {showAssignModal && selectedSubject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAssignModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-dark-light rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {assignType === "supervisor" ? "تعيين مشرف" : "تسجيل طالب"} - {selectedSubject.name}
                  </h2>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-dark-lighter rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {assignType === "supervisor" ? (
                  <div>
                    {/* TODO: قائمة المشرفين - يجب إضافتها من API */}
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      قائمة المشرفين (يجب إضافة API لجلب المشرفين)
                    </p>
                    {/* List of assigned supervisors */}
                    {selectedSubject.supervisors && selectedSubject.supervisors.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium text-slate-900 dark:text-white mb-2">المشرفون المعينون:</h3>
                        {selectedSubject.supervisors.map((supervisor) => (
                          <div
                            key={supervisor.id || supervisor.user_id}
                            className="flex justify-between items-center p-3 bg-slate-50 dark:bg-dark-lighter rounded-lg"
                          >
                            <span className="text-slate-900 dark:text-white">
                              {supervisor.name || supervisor.first_name || `المشرف ${supervisor.id}`}
                            </span>
                            <button
                              onClick={() => handleRemoveSupervisor(supervisor.id || supervisor.user_id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                            >
                              <UserX size={18} className="text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Available students for enrollment */}
                    <h3 className="font-medium text-slate-900 dark:text-white mb-3">الطلاب المتاحون:</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getAvailableStudents(selectedSubject).map((student) => (
                        <div
                          key={student.id}
                          className="flex justify-between items-center p-3 bg-slate-50 dark:bg-dark-lighter rounded-lg"
                        >
                          <span className="text-slate-900 dark:text-white">
                            {student.studentName || student.name || `الطالب ${student.id}`}
                          </span>
                          <button
                            onClick={() => handleEnrollStudent(student.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                          >
                            تسجيل
                          </button>
                        </div>
                      ))}
                      {getAvailableStudents(selectedSubject).length === 0 && (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                          جميع الطلاب مسجلون في هذه المادة
                        </p>
                      )}
                    </div>

                    {/* Enrolled students */}
                    {selectedSubject.students && selectedSubject.students.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-lighter">
                        <h3 className="font-medium text-slate-900 dark:text-white mb-3">الطلاب المسجلون:</h3>
                        <div className="space-y-2">
                          {selectedSubject.students.map((student) => (
                            <div
                              key={student.id || student.user_id}
                              className="flex justify-between items-center p-3 bg-slate-50 dark:bg-dark-lighter rounded-lg"
                            >
                              <span className="text-slate-900 dark:text-white">
                                {student.name || student.studentName || `الطالب ${student.id}`}
                              </span>
                              <button
                                onClick={() => handleUnenrollStudent(student.id || student.user_id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                              >
                                <UserX size={18} className="text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedWrapper>
  );
}

