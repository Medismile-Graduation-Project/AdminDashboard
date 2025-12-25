"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRtl } from "@/hooks/useRtl";
import { useRole } from "@/hooks/useRole";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import { fetchAuditLogs, fetchAuditStatistics } from "@/services/auditApi";
import { Activity, Search, Filter, Calendar, User, FileText, RefreshCw } from "lucide-react";
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
} from "recharts";

/**
 * صفحة سجلات التدقيق
 * متاحة فقط لإدارة الجامعة
 */
export default function AuditLogsPage() {
  return (
    <RoleGuard>
      <AuditLogsContent />
    </RoleGuard>
  );
}

function AuditLogsContent() {
  const { t } = useTranslation();
  const isRtl = useRtl();
  const { canAccess } = useRole();

  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user_id: "",
    action: "",
    content_type: "",
    start_date: "",
    end_date: "",
    search: "",
  });

  // جلب البيانات
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // جلب السجلات
      const logsData = await fetchAuditLogs(filters);
      setLogs(logsData);

      // جلب الإحصائيات (مع معالجة الأخطاء)
      try {
        const statsData = await fetchAuditStatistics();
        setStatistics(statsData);
      } catch (error) {
        // إذا فشل، نستخدم قيم افتراضية
        setStatistics({
          action_counts: [],
          top_users: [],
          daily_activity: [],
        });
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      user_id: "",
      action: "",
      content_type: "",
      start_date: "",
      end_date: "",
      search: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action) => {
    const colors = {
      create: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      update: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      delete: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      view: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return colors[action] || colors.view;
  };

  if (loading) {
    return (
      <AnimatedWrapper>
        <div className={`p-6 ${isRtl ? "text-right" : "text-left"}`}>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </AnimatedWrapper>
    );
  }

  return (
    <AnimatedWrapper>
      <div className={`p-6 space-y-6 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              سجلات التدقيق
            </h1>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <RefreshCw size={18} />
            تحديث
          </button>
        </div>

        {/* Statistics Charts */}
        {statistics && canAccess("audit.statistics") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Action Counts Chart */}
            {statistics.action_counts && (
              <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                  توزيع الإجراءات
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statistics.action_counts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="action" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#0ea5e9" name="عدد الإجراءات" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Daily Activity Chart */}
            {statistics.daily_activity && (
              <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                  النشاط اليومي
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={statistics.daily_activity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      name="عدد الإجراءات"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="p-4 bg-slate-100 dark:bg-dark-light rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">الفلاتر</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                بحث
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="ابحث في الوصف..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                نوع الإجراء
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">الكل</option>
                <option value="create">إنشاء</option>
                <option value="update">تحديث</option>
                <option value="delete">حذف</option>
                <option value="view">عرض</option>
              </select>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                نوع المحتوى
              </label>
              <select
                value={filters.content_type}
                onChange={(e) => handleFilterChange("content_type", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">الكل</option>
                <option value="case">حالة</option>
                <option value="appointment">موعد</option>
                <option value="evaluation">تقييم</option>
                <option value="report">تقرير</option>
                <option value="user">مستخدم</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                من تاريخ
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange("start_date", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                إلى تاريخ
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange("end_date", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-dark rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-dark-light">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    المستخدم
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    الإجراء
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    نوع المحتوى
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    الوصف
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-dark-light transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-slate-400" />
                          <span>
                            {log.user?.first_name || ""} {log.user?.last_name || ""}
                          </span>
                          <span className="text-slate-400">
                            ({log.user?.email || log.user?.username || "غير معروف"})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-slate-400" />
                          {log.content_type || "غير محدد"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {log.description || "لا يوجد وصف"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {log.ip_address || "غير متوفر"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      لا توجد سجلات تدقيق
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users */}
        {statistics?.top_users && canAccess("audit.statistics") && (
          <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              أكثر المستخدمين نشاطاً
            </h2>
            <div className="space-y-2">
              {statistics.top_users.slice(0, 5).map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white dark:bg-dark rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400">#{index + 1}</span>
                    <span className="text-slate-900 dark:text-white">
                      {user.user__email || user.email || "غير معروف"}
                    </span>
                  </div>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">
                    {user.count} إجراء
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedWrapper>
  );
}

