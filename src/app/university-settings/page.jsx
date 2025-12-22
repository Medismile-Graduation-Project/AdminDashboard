"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUniversityAsync,
  fetchFacultiesAsync,
  fetchProgramsAsync,
  fetchAcademicYearsAsync,
  createFacultyAsync,
  createProgramAsync,
  createAcademicYearAsync,
  updateUniversityAsync,
  clearUniversityError,
} from "@/redux/features/university/universitySlice";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";

export default function UniversitySettingsPage() {
  return (
    <RoleGuard allowedRoles={["university_admin"]}>
      <UniversitySettingsContent />
    </RoleGuard>
  );
}

function UniversitySettingsContent() {
  const dispatch = useDispatch();
  const { university, faculties, programs, academicYears, loading, error } =
    useSelector((state) => state.university);

  const [mounted, setMounted] = useState(false);
  const [universityId, setUniversityId] = useState(null);

  // نماذج بسيطة للإضافة
  const [facultyName, setFacultyName] = useState("");
  const [programName, setProgramName] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [academicYearName, setAcademicYearName] = useState("");

  // نموذج بسيط لتحديث وصف الجامعة
  const [universityDescription, setUniversityDescription] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const uniId = storedUser?.university_id || storedUser?.university || null;
      if (uniId) {
        setUniversityId(uniId);
        dispatch(fetchUniversityAsync(uniId));
        dispatch(fetchFacultiesAsync(uniId));
        dispatch(fetchProgramsAsync(uniId));
        dispatch(fetchAcademicYearsAsync(uniId));
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (university?.description) {
      setUniversityDescription(university.description);
    }
  }, [university]);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!facultyName || !universityId) return;
    await dispatch(
      createFacultyAsync({
        universityId,
        payload: { name: facultyName },
      })
    ).unwrap().catch(() => {});
    setFacultyName("");
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!programName || !programCode || !universityId) return;
    await dispatch(
      createProgramAsync({
        universityId,
        payload: {
          name: programName,
          code: programCode,
        },
      })
    ).unwrap().catch(() => {});
    setProgramName("");
    setProgramCode("");
  };

  const handleCreateAcademicYear = async (e) => {
    e.preventDefault();
    if (!academicYearName || !universityId) return;
    await dispatch(
      createAcademicYearAsync({
        universityId,
        payload: {
          name: academicYearName,
        },
      })
    ).unwrap().catch(() => {});
    setAcademicYearName("");
  };

  const handleUpdateUniversity = async (e) => {
    e.preventDefault();
    if (!universityId) return;
    await dispatch(
      updateUniversityAsync({
        universityId,
        payload: { description: universityDescription },
      })
    ).unwrap().catch(() => {});
  };

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-sky-50 dark:bg-slate-900" />
    );
  }

  return (
    <AnimatedWrapper>
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            إعدادات الجامعة
          </h1>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <div className="flex justify-between">
                <span>{typeof error === "string" ? error : "حدث خطأ"}</span>
                <button
                  className="text-xs underline"
                  onClick={() => dispatch(clearUniversityError())}
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}

          {/* بيانات الجامعة الأساسية */}
          <section className="border rounded-lg p-4 bg-white dark:bg-dark-light">
            <h2 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">
              بيانات الجامعة
            </h2>
            {loading && !university ? (
              <p className="text-sm text-slate-500">جاري التحميل...</p>
            ) : university ? (
              <form onSubmit={handleUpdateUniversity} className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    الاسم:{" "}
                    <span className="font-medium">
                      {university.name || "-"}
                    </span>
                  </p>
                  {university.short_name && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      الاختصار:{" "}
                      <span className="font-medium">
                        {university.short_name}
                      </span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">
                    الوصف
                  </label>
                  <textarea
                    value={universityDescription}
                    onChange={(e) => setUniversityDescription(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-md bg-sky-600 text-white disabled:opacity-50"
                >
                  حفظ بيانات الجامعة
                </button>
              </form>
            ) : (
              <p className="text-sm text-slate-500">
                لم يتم العثور على بيانات الجامعة.
              </p>
            )}
          </section>

          {/* الكليات */}
          <section className="border rounded-lg p-4 bg-white dark:bg-dark-light">
            <h2 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">
              الكليات
            </h2>
            <form
              onSubmit={handleCreateFaculty}
              className="flex flex-col sm:flex-row gap-2 mb-3"
            >
              <input
                type="text"
                placeholder="اسم الكلية"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!facultyName || loading}
                className="px-4 py-2 text-sm rounded-md bg-sky-600 text-white disabled:opacity-50"
              >
                إضافة كلية
              </button>
            </form>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {faculties && faculties.length > 0 ? (
                faculties.map((f) => (
                  <li key={f.id}>
                    - {f.name}{" "}
                    {f.description ? (
                      <span className="text-slate-500">({f.description})</span>
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-slate-500">لا توجد كليات بعد.</li>
              )}
            </ul>
          </section>

          {/* البرامج الأكاديمية */}
          <section className="border rounded-lg p-4 bg-white dark:bg-dark-light">
            <h2 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">
              البرامج الأكاديمية
            </h2>
            <form
              onSubmit={handleCreateProgram}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3"
            >
              <input
                type="text"
                placeholder="اسم البرنامج"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="رمز البرنامج"
                value={programCode}
                onChange={(e) => setProgramCode(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!programName || !programCode || loading}
                className="px-4 py-2 text-sm rounded-md bg-sky-600 text-white disabled:opacity-50"
              >
                إضافة برنامج
              </button>
            </form>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {programs && programs.length > 0 ? (
                programs.map((p) => (
                  <li key={p.id}>
                    - {p.name}{" "}
                    {p.code ? (
                      <span className="text-slate-500">({p.code})</span>
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-slate-500">لا توجد برامج بعد.</li>
              )}
            </ul>
          </section>

          {/* السنوات الأكاديمية */}
          <section className="border rounded-lg p-4 bg-white dark:bg-dark-light">
            <h2 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">
              السنوات الأكاديمية
            </h2>
            <form
              onSubmit={handleCreateAcademicYear}
              className="flex flex-col sm:flex-row gap-2 mb-3"
            >
              <input
                type="text"
                placeholder="مثال: 2024/2025"
                value={academicYearName}
                onChange={(e) => setAcademicYearName(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!academicYearName || loading}
                className="px-4 py-2 text-sm rounded-md bg-sky-600 text-white disabled:opacity-50"
              >
                إضافة سنة أكاديمية
              </button>
            </form>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {academicYears && academicYears.length > 0 ? (
                academicYears.map((y) => (
                  <li key={y.id}>
                    - {y.name}{" "}
                    {y.is_active ? (
                      <span className="text-xs text-green-600 ms-1">
                        (نشطة)
                      </span>
                    ) : null}
                  </li>
                ))
              ) : (
                <li className="text-slate-500">لا توجد سنوات أكاديمية بعد.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </AnimatedWrapper>
  );
}




