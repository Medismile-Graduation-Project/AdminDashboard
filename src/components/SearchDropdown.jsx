"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  GraduationCap, 
  Users, 
  FileText, 
  Calendar, 
  Star,
  X,
  Loader2
} from "lucide-react";
import { unifiedSearch, highlightMatchReact } from "@/lib/searchUtils";
import { useRtl } from "@/hooks/useRtl";

/**
 * SearchDropdown Component
 * يعرض نتائج البحث في dropdown مع Highlighting
 */
export default function SearchDropdown({ 
  query, 
  onClose, 
  maxResults = 5 
}) {
  const router = useRouter();
  const isRtl = useRtl();
  const dropdownRef = useRef(null);
  
  // جلب البيانات من Redux
  const { students } = useSelector((state) => state.students);
  const { supervisors } = useSelector((state) => state.supervisors);
  const { cases } = useSelector((state) => state.clinicalCases);
  const { appointments } = useSelector((state) => state.appointments);
  const { evaluations } = useSelector((state) => state.evaluations);

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // البحث عند تغيير query
  useEffect(() => {
    if (!query || query.trim() === "") {
      setResults(null);
      return;
    }

    setIsLoading(true);
    
    // استخدام debounce بسيط
    const timeoutId = setTimeout(() => {
      const searchResults = unifiedSearch(query, {
        students: students || [],
        supervisors: supervisors || [],
        cases: cases || [],
        appointments: appointments || [],
        evaluations: evaluations || []
      });

      // أخذ أول maxResults من كل نوع
      const limitedResults = {
        students: searchResults.students.slice(0, maxResults),
        supervisors: searchResults.supervisors.slice(0, maxResults),
        cases: searchResults.cases.slice(0, maxResults),
        appointments: searchResults.appointments.slice(0, maxResults),
        evaluations: searchResults.evaluations.slice(0, maxResults),
        total: Math.min(searchResults.total, maxResults * 5)
      };

      setResults(limitedResults);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, students, supervisors, cases, appointments, evaluations, maxResults]);

  // إغلاق عند النقر خارج الـ dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // معالجة النقر على نتيجة
  const handleResultClick = (item, type) => {
    let route = "#";
    
    switch (type) {
      case "student":
        route = `/users/students?studentId=${item.id}`;
        break;
      case "supervisor":
        route = `/users/supervisors?supervisorId=${item.id}`;
        break;
      case "case":
        route = `/university-cases/${item.id}`;
        break;
      case "appointment":
        route = `/university-appointments?appointmentId=${item.id}`;
        break;
      case "evaluation":
        route = `/evaluations/${item.id}`;
        break;
    }

    if (route !== "#") {
      router.push(route);
      onClose();
    }
  };

  // الحصول على عنوان العنصر
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

  // الحصول على وصف العنصر
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

  // الحصول على أيقونة النوع
  const getTypeIcon = (type) => {
    switch (type) {
      case "student":
        return GraduationCap;
      case "supervisor":
        return Users;
      case "case":
        return FileText;
      case "appointment":
        return Calendar;
      case "evaluation":
        return Star;
      default:
        return Search;
    }
  };

  if (!query || query.trim() === "") return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-light 
          border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl
          max-h-[500px] overflow-y-auto z-50
          ${isRtl ? "text-right" : "text-left"}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={24} />
          </div>
        ) : results && results.total > 0 ? (
          <div className="p-2">
            {/* Students */}
            {results.students.length > 0 && (
              <ResultSection
                title="الطلاب"
                icon={GraduationCap}
                items={results.students}
                type="student"
                query={query}
                onItemClick={handleResultClick}
                getItemTitle={getItemTitle}
                getItemSubtitle={getItemSubtitle}
                isRtl={isRtl}
              />
            )}

            {/* Supervisors */}
            {results.supervisors.length > 0 && (
              <ResultSection
                title="المشرفين"
                icon={Users}
                items={results.supervisors}
                type="supervisor"
                query={query}
                onItemClick={handleResultClick}
                getItemTitle={getItemTitle}
                getItemSubtitle={getItemSubtitle}
                isRtl={isRtl}
              />
            )}

            {/* Cases */}
            {results.cases.length > 0 && (
              <ResultSection
                title="الحالات"
                icon={FileText}
                items={results.cases}
                type="case"
                query={query}
                onItemClick={handleResultClick}
                getItemTitle={getItemTitle}
                getItemSubtitle={getItemSubtitle}
                isRtl={isRtl}
              />
            )}

            {/* Appointments */}
            {results.appointments.length > 0 && (
              <ResultSection
                title="المواعيد"
                icon={Calendar}
                items={results.appointments}
                type="appointment"
                query={query}
                onItemClick={handleResultClick}
                getItemTitle={getItemTitle}
                getItemSubtitle={getItemSubtitle}
                isRtl={isRtl}
              />
            )}

            {/* Evaluations */}
            {results.evaluations.length > 0 && (
              <ResultSection
                title="التقييمات"
                icon={Star}
                items={results.evaluations}
                type="evaluation"
                query={query}
                onItemClick={handleResultClick}
                getItemTitle={getItemTitle}
                getItemSubtitle={getItemSubtitle}
                isRtl={isRtl}
              />
            )}

            {/* View All Link */}
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="w-full px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 
                  hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
              >
                عرض جميع النتائج ({results.total})
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Search className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              لا توجد نتائج
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * ResultSection Component
 * يعرض قسم من النتائج
 */
function ResultSection({ 
  title, 
  icon: Icon, 
  items, 
  type, 
  query, 
  onItemClick, 
  getItemTitle, 
  getItemSubtitle,
  isRtl 
}) {
  return (
    <div className="mb-2">
      <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold 
        text-slate-500 dark:text-slate-400 uppercase ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
        <Icon size={14} />
        <span>{title}</span>
        <span className="ml-auto text-slate-400 dark:text-slate-500">({items.length})</span>
      </div>
      {items.map((item) => {
        const title = getItemTitle(item, type);
        const subtitle = getItemSubtitle(item, type);
        
        return (
          <motion.div
            key={item.id}
            whileHover={{ backgroundColor: "rgba(14, 165, 233, 0.1)" }}
            onClick={() => onItemClick(item, type)}
            className={`px-3 py-2 rounded-lg cursor-pointer transition-colors
              hover:bg-sky-50 dark:hover:bg-sky-900/20 ${isRtl ? "text-right" : "text-left"}`}
          >
            <div className="font-medium text-slate-900 dark:text-white text-sm mb-0.5">
              {highlightMatchReact(title, query)}
            </div>
            {subtitle && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {highlightMatchReact(subtitle, query)}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

