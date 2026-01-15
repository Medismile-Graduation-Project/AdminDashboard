"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Search, 
  Users, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Star,
  Loader2,
  ArrowRight,
  X
} from "lucide-react";
import { unifiedSearch, highlightMatchReact } from "@/lib/searchUtils";
import { fetchStudentsAsync } from "@/redux/features/students/studentsSlice";
import { fetchSupervisorsAsync } from "@/redux/features/supervisors/supervisorsSlice";
import { fetchCases } from "@/redux/features/clinicalCases/clinicalCasesSlice";
import { fetchAppointmentsAsync } from "@/redux/features/appointments/appointmentsSlice";
import { fetchEvaluationsAsync } from "@/redux/features/evaluations/evaluationsSlice";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import RoleGuard from "@/components/RoleGuard";
import { useRtl } from "@/hooks/useRtl";

export default function SearchPage() {
  return (
    <RoleGuard>
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={32} />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </RoleGuard>
  );
}

function SearchContent() {
  const { t, i18n } = useTranslation();
  const isRtl = useRtl();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // جلب البيانات من Redux
  const { students, loading: studentsLoading } = useSelector((state) => state.students);
  const { supervisors, loading: supervisorsLoading } = useSelector((state) => state.supervisors);
  const { cases, loading: casesLoading } = useSelector((state) => state.clinicalCases);
  const { appointments, loading: appointmentsLoading } = useSelector((state) => state.appointments);
  const { evaluations, loading: evaluationsLoading } = useSelector((state) => state.evaluations);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // جلب query من URL
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  // جلب جميع البيانات عند التحميل
  useEffect(() => {
    dispatch(fetchStudentsAsync());
    dispatch(fetchSupervisorsAsync());
    dispatch(fetchCases({}));
    dispatch(fetchAppointmentsAsync({}));
    dispatch(fetchEvaluationsAsync({}));
  }, [dispatch]);

  // البحث عند تغيير query
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = unifiedSearch(searchQuery, {
        students: students || [],
        supervisors: supervisors || [],
        cases: cases || [],
        appointments: appointments || [],
        evaluations: evaluations || []
      });
      setResults(searchResults);
    } else {
      setResults(null);
    }
  }, [searchQuery, students, supervisors, cases, appointments, evaluations]);

  // معالجة البحث
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // تنظيف البحث
  const handleClear = () => {
    setSearchQuery("");
    setResults(null);
    router.push("/search");
  };

  // تحديد التبويب النشط
  const tabs = [
    { id: "all", label: "الكل", icon: Search, count: results?.total || 0 },
    { id: "students", label: "الطلاب", icon: GraduationCap, count: results?.students.length || 0 },
    { id: "supervisors", label: "المشرفين", icon: Users, count: results?.supervisors.length || 0 },
    { id: "cases", label: "الحالات", icon: FileText, count: results?.cases.length || 0 },
    { id: "appointments", label: "المواعيد", icon: Calendar, count: results?.appointments.length || 0 },
    { id: "evaluations", label: "التقييمات", icon: Star, count: results?.evaluations.length || 0 },
  ];

  // تحديد النتائج المعروضة حسب التبويب
  const getDisplayedResults = () => {
    if (!results) return null;
    
    switch (activeTab) {
      case "students":
        return { students: results.students };
      case "supervisors":
        return { supervisors: results.supervisors };
      case "cases":
        return { cases: results.cases };
      case "appointments":
        return { appointments: results.appointments };
      case "evaluations":
        return { evaluations: results.evaluations };
      default:
        return results;
    }
  };

  const displayedResults = getDisplayedResults();
  const isLoading = studentsLoading || supervisorsLoading || casesLoading || 
                   appointmentsLoading || evaluationsLoading;

  if (!mounted) return null;

  return (
    <AnimatedWrapper>
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 dark:bg-dark py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              🔍 البحث الموحد
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              ابحث في جميع البيانات: الطلاب، المشرفين، الحالات، المواعيد، والتقييمات
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 ${isRtl ? "right-4" : "left-4"} text-slate-400`} size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن طالب، مشرف، حالة، موعد، أو تقييم..."
                className={`w-full ${isRtl ? "pr-12 pl-4" : "pl-12 pr-4"} py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
                  bg-white dark:bg-dark-light
                  placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white 
                  focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 
                  focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 
                  text-base transition-all duration-200`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`absolute top-1/2 transform -translate-y-1/2 ${isRtl ? "left-4" : "right-4"} 
                    p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                >
                  <X size={18} className="text-slate-400" />
                </button>
              )}
            </div>
          </form>

          {/* Loading State */}
          {isLoading && !results && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={32} />
            </div>
          )}

          {/* Results Summary */}
          {results && results.total > 0 && (
            <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
              <p className="text-sky-900 dark:text-sky-100 font-semibold">
                📊 تم العثور على <span className="text-sky-600 dark:text-sky-400">{results.total}</span> نتيجة
              </p>
            </div>
          )}

          {/* Tabs */}
          {results && results.total > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm transition-all duration-200
                      ${isActive
                        ? "bg-sky-600 text-white dark:bg-sky-600"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive 
                          ? "bg-white/20 text-white" 
                          : "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {results && results.total === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
              <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">
                لم يتم العثور على نتائج
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                جرب البحث بكلمات مختلفة أو تحقق من الإملاء
              </p>
            </div>
          )}

          {/* Results */}
          {displayedResults && (
            <div className="space-y-6">
              {/* Students Results */}
              {(activeTab === "all" || activeTab === "students") && displayedResults.students && displayedResults.students.length > 0 && (
                <ResultsSection
                  title="الطلاب"
                  icon={GraduationCap}
                  count={displayedResults.students.length}
                  items={displayedResults.students}
                  type="student"
                  router={router}
                  isRtl={isRtl}
                  query={searchQuery}
                />
              )}

              {/* Supervisors Results */}
              {(activeTab === "all" || activeTab === "supervisors") && displayedResults.supervisors && displayedResults.supervisors.length > 0 && (
                <ResultsSection
                  title="المشرفين"
                  icon={Users}
                  count={displayedResults.supervisors.length}
                  items={displayedResults.supervisors}
                  type="supervisor"
                  router={router}
                  isRtl={isRtl}
                  query={searchQuery}
                />
              )}

              {/* Cases Results */}
              {(activeTab === "all" || activeTab === "cases") && displayedResults.cases && displayedResults.cases.length > 0 && (
                <ResultsSection
                  title="الحالات السريرية"
                  icon={FileText}
                  count={displayedResults.cases.length}
                  items={displayedResults.cases}
                  type="case"
                  router={router}
                  isRtl={isRtl}
                  query={searchQuery}
                />
              )}

              {/* Appointments Results */}
              {(activeTab === "all" || activeTab === "appointments") && displayedResults.appointments && displayedResults.appointments.length > 0 && (
                <ResultsSection
                  title="المواعيد"
                  icon={Calendar}
                  count={displayedResults.appointments.length}
                  items={displayedResults.appointments}
                  type="appointment"
                  router={router}
                  isRtl={isRtl}
                  query={searchQuery}
                />
              )}

              {/* Evaluations Results */}
              {(activeTab === "all" || activeTab === "evaluations") && displayedResults.evaluations && displayedResults.evaluations.length > 0 && (
                <ResultsSection
                  title="التقييمات"
                  icon={Star}
                  count={displayedResults.evaluations.length}
                  items={displayedResults.evaluations}
                  type="evaluation"
                  router={router}
                  isRtl={isRtl}
                  query={searchQuery}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

// مكون عرض قسم النتائج
function ResultsSection({ title, icon: Icon, count, items, type, router, isRtl, query }) {
  const getRoute = (item, type) => {
    switch (type) {
      case "student":
        return `/users/students?studentId=${item.id}`;
      case "supervisor":
        return `/users/supervisors?supervisorId=${item.id}`;
      case "case":
        return `/university-cases/${item.id}`;
      case "appointment":
        return `/university-appointments?appointmentId=${item.id}`;
      case "evaluation":
        return `/evaluations/${item.id}`;
      default:
        return "#";
    }
  };

  const getItemTitle = (item, type) => {
    switch (type) {
      case "student":
        return `${item.first_name || ""} ${item.last_name || ""}`.trim() || item.email || "-";
      case "supervisor":
        return `${item.first_name || ""} ${item.last_name || ""}`.trim() || item.email || "-";
      case "case":
        return item.title || "-";
      case "appointment":
        return item.title || item.patient_name || "-";
      case "evaluation":
        return item.title || "-";
      default:
        return "-";
    }
  };

  const getItemSubtitle = (item, type) => {
    switch (type) {
      case "student":
        return item.email || item.student_id || "";
      case "supervisor":
        return item.email || item.department || "";
      case "case":
        return item.patient_name || item.description?.substring(0, 50) || "";
      case "appointment":
        return item.patient_name || item.notes?.substring(0, 50) || "";
      case "evaluation":
        return item.student_name || item.description?.substring(0, 50) || "";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-light rounded-xl border border-slate-200 dark:border-slate-700 p-6"
    >
      <div className={`flex items-center gap-3 mb-4 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
        <Icon className="text-sky-600 dark:text-sky-400" size={24} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm font-semibold">
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 
              hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/10
              transition-all duration-200 cursor-pointer"
            onClick={() => router.push(getRoute(item, type))}
          >
            <div className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {highlightMatchReact(getItemTitle(item, type), query)}
                </h3>
                {getItemSubtitle(item, type) && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {highlightMatchReact(getItemSubtitle(item, type), query)}
                  </p>
                )}
              </div>
              <ArrowRight 
                className={`text-slate-400 ${isRtl ? "rotate-180" : ""}`} 
                size={20} 
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

