"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRtl } from "@/hooks/useRtl";
import { getUser, isUniversityAdmin } from "@/lib/auth";
import { dashboardCards, quickActions } from "@/lib/roleConfig";
import SharedCards from "./SharedCards";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import dynamic from "next/dynamic";
import Link from "next/link";

const BellIcon = dynamic(
  () => import("@heroicons/react/24/outline").then((mod) => mod.BellIcon),
  { ssr: false }
);

/**
 * Dashboard مخصصة لإدارة الجامعة (University Admin)
 * 
 * بناءً على:
 * - توثيق Backend API
 * - الصلاحيات: IsAuthenticated + IsUniversityAdmin
 * - نطاق الوصول: يقتصر على بيانات الجامعة فقط
 */
export default function UniversityAdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = useRtl();
  const [user, setUser] = useState(null);

  // State للإحصائيات
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSupervisors: 0,
    activeCases: 0,
    pendingContent: 0,
    totalEvaluations: 0,
    reportsGenerated: 0,
  });

  // State للـ Charts
  const [studentsByYear, setStudentsByYear] = useState([]);
  const [supervisorsByDepartment, setSupervisorsByDepartment] = useState([]);
  const [userDistribution, setUserDistribution] = useState([
    { name: "طلاب", value: 0 },
    { name: "مشرفين", value: 0 },
  ]);

  // State لإحصائيات Audit
  const [auditStatistics, setAuditStatistics] = useState({
    action_counts: [],
    top_users: [],
    daily_activity: [],
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // التحقق من المستخدم
  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    
    if (!isUniversityAdmin()) {
      // إذا لم يكن مسؤول جامعة، نوجه للـ login
      window.location.href = "/login";
    }
  }, []);

  // جلب جميع البيانات
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // جلب جميع إحصائيات Dashboard
        const { fetchUniversityAdminDashboardStats } = await import(
          "@/services/dashboardApi"
        );
        const dashboardData = await fetchUniversityAdminDashboardStats();

        // تحديث الإحصائيات الأساسية
        setStats({
          totalStudents: dashboardData.totalStudents,
          totalSupervisors: dashboardData.totalSupervisors,
          activeCases: dashboardData.activeCases,
          pendingContent: dashboardData.pendingContent,
          totalEvaluations: dashboardData.totalEvaluations,
          reportsGenerated: dashboardData.reportsGenerated,
        });

        // تحديث Charts
        setStudentsByYear(dashboardData.studentsByYear || []);
        setSupervisorsByDepartment(dashboardData.supervisorsByDepartment || []);
        setUserDistribution([
          { name: "طلاب", value: dashboardData.totalStudents },
          { name: "مشرفين", value: dashboardData.totalSupervisors },
        ]);

        // تحديث إحصائيات Audit
        setAuditStatistics(dashboardData.auditStatistics || {
          action_counts: [],
          top_users: [],
          daily_activity: [],
        });

        // 🔕 الإشعارات معلقة مؤقتاً
        // جلب الإشعارات
        // const { fetchNotifications } = await import("@/services/notificationsApi");
        // const notificationsData = await fetchNotifications({
        //   recipient_id: user.id,
        //   status: "unread",
        // });
        // const formattedNotifications = notificationsData.slice(0, 5).map((notif) => ({
        //   message: notif.message || notif.title || "إشعار جديد",
        //   time: formatTimeAgo(notif.created_at),
        //   href: getNotificationHref(notif),
        // }));
        // setNotifications(formattedNotifications);
        setNotifications([]); // مؤقتاً - لا إشعارات
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Helper functions
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "منذ وقت غير محدد";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    if (diffDays < 7) return `قبل ${diffDays} يوم`;
    return date.toLocaleDateString("ar-SA");
  };

  const getNotificationHref = (notification) => {
    if (notification.type === "content_approval") return "/community-moderation";
    if (notification.type === "report_generated") return "/reports";
    return "/notifications";
  };

  // تحديث Cards مع القيم الفعلية
  const cardsWithValues = (dashboardCards || []).map((card) => {
    const valueMap = {
      total_students: stats.totalStudents,
      total_supervisors: stats.totalSupervisors,
      active_cases: stats.activeCases,
      pending_content: stats.pendingContent,
      total_evaluations: stats.totalEvaluations,
      reports_generated: stats.reportsGenerated,
    };
    return {
      ...card,
      value: valueMap[card.id] || card.value || 0,
    };
  });

  const COLORS = ["#0ea5e9", "#bae6fd", "#7c3aed", "#ec4899", "#f59e0b"];

  // Loading state
  if (loading) {
    return (
      <div className={`p-6 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isRtl ? "text-right" : "text-left"}`}>

      {/* Dashboard Cards */}
      <div className="mb-6">
        <SharedCards cards={cardsWithValues} />
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Row 1: Students & Supervisors Distribution */}
        <div
          className={`flex flex-col lg:flex-row gap-4 ${
            isRtl ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* توزيع الطلاب حسب السنة */}
          {studentsByYear.length > 0 && (
            <div className="p-5 sm:p-6 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-[300px]">
              <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">
                توزيع الطلاب حسب السنة الدراسية
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={studentsByYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0ea5e9" name="عدد الطلاب" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* توزيع المشرفين حسب القسم */}
          {supervisorsByDepartment.length > 0 && (
            <div className="p-5 sm:p-6 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-[300px]">
              <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">
                توزيع المشرفين حسب القسم
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={supervisorsByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="department"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#bae6fd" name="عدد المشرفين" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* توزيع المستخدمين (Pie Chart) */}
          {(userDistribution[0].value > 0 || userDistribution[1].value > 0) && (
            <div className="p-5 sm:p-6 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-[300px]">
              <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">
                توزيع المستخدمين
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Row 2: Audit Statistics */}
        {auditStatistics.action_counts.length > 0 ||
        auditStatistics.daily_activity.length > 0 ? (
          <div
            className={`flex flex-col lg:flex-row gap-4 ${
              isRtl ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* توزيع الإجراءات */}
            {auditStatistics.action_counts.length > 0 && (
              <div className="p-5 sm:p-6 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-[300px]">
                <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">
                  توزيع الإجراءات
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={auditStatistics.action_counts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="action" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#7c3aed" name="عدد الإجراءات" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* النشاط اليومي */}
            {auditStatistics.daily_activity.length > 0 && (
              <div className="p-5 sm:p-6 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-[300px]">
                <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">
                  النشاط اليومي (آخر 30 يوم)
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={auditStatistics.daily_activity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#ec4899"
                      strokeWidth={3}
                      name="عدد الإجراءات"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Notifications & Quick Actions */}
      <div
        className={`flex flex-col lg:flex-row gap-4 ${
          isRtl ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Notifications */}
        <div className="p-5 sm:p-6 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-[250px]">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2.5 text-slate-900 dark:text-white">
            <BellIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" /> 
            <span>الإشعارات</span>
          </h2>
          <ul
            className={`space-y-3 ${
              isRtl ? "text-right" : "text-left"
            }`}
          >
            {notifications.length > 0 ? (
              notifications.map((note, idx) => (
                <li key={idx} className="pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                  <Link href={note.href || "#"} className="block group">
                    <p className="text-sky-700 dark:text-sky-300 group-hover:text-sky-900 dark:group-hover:text-sky-100 transition-colors text-sm font-medium mb-1">
                      {note.message}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{note.time}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400 text-sm py-2">
                لا توجد إشعارات جديدة
              </li>
            )}
          </ul>
        </div>

        {/* Quick Actions */}
        {quickActions && quickActions.length > 0 && (
          <div className="p-5 sm:p-6 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-w-[250px]">
            <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">
              إجراءات سريعة
            </h2>
            <ul className={`space-y-2.5 ${isRtl ? "text-right" : "text-left"}`}>
              {quickActions.map((action, idx) => {
                const ActionIcon = action.icon;
                const actionName = isRtl ? action.name : action.nameEn || action.name;
                return (
                  <li key={idx}>
                    <Link
                      href={action.href}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all duration-200 group"
                    >
                      {ActionIcon && <ActionIcon size={18} className="group-hover:scale-110 transition-transform" />}
                      <span className="text-sm font-medium">{actionName}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
