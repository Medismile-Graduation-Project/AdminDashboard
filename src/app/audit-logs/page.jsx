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
      <div className={`p-6 sm:p-8 space-y-8 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Activity className="h-8 w-8 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {t("AuditLogs.title")}
            </h1>
          </div>
          <button
            onClick={loadData}
            className={`flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <RefreshCw size={18} />
            {t("AuditLogs.refresh")}
          </button>
        </div>

        {/* Statistics Charts */}
        {statistics && canAccess("audit.statistics") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Counts Chart */}
            {statistics.action_counts && (
              <div className="p-5 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">
                  {t("AuditLogs.actionDistribution")}
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statistics.action_counts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="action" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#0ea5e9" name={t("AuditLogs.actionCount")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Daily Activity Chart */}
            {statistics.daily_activity && (
              <div className="p-5 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">
                  {t("AuditLogs.dailyActivity")}
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={statistics.daily_activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      name={t("AuditLogs.actionCount")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="p-5 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className={`flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Filter size={20} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("AuditLogs.filters")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("AuditLogs.search")}
              </label>
              <div className="relative">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder={t("AuditLogs.searchPlaceholder")}
                  className={`w-full ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200`}
                />
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("AuditLogs.actionType")}
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
              >
                <option value="">{t("AuditLogs.all")}</option>
                <option value="create">{t("AuditLogs.actions.create")}</option>
                <option value="update">{t("AuditLogs.actions.update")}</option>
                <option value="delete">{t("AuditLogs.actions.delete")}</option>
                <option value="view">{t("AuditLogs.actions.view")}</option>
              </select>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("AuditLogs.contentType")}
              </label>
              <select
                value={filters.content_type}
                onChange={(e) => handleFilterChange("content_type", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200"
              >
                <option value="">{t("AuditLogs.all")}</option>
                <option value="case">{t("AuditLogs.contentTypes.case")}</option>
                <option value="appointment">{t("AuditLogs.contentTypes.appointment")}</option>
                <option value="evaluation">{t("AuditLogs.contentTypes.evaluation")}</option>
                <option value="report">{t("AuditLogs.contentTypes.report")}</option>
                <option value="user">{t("AuditLogs.contentTypes.user")}</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("AuditLogs.fromDate")}
              </label>
              <div className="relative">
                <Calendar className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange("start_date", e.target.value)}
                  className={`w-full ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200`}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("AuditLogs.toDate")}
              </label>
              <div className="relative">
                <Calendar className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange("end_date", e.target.value)}
                  className={`w-full ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200`}
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
              >
                {t("AuditLogs.reset")}
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className={`w-full ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {t("AuditLogs.table.date")}
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {t("AuditLogs.table.user")}
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {t("AuditLogs.table.action")}
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {t("AuditLogs.table.contentType")}
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {t("AuditLogs.table.description")}
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {t("AuditLogs.table.ipAddress")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <User size={16} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />
                          <span className="font-medium">
                            {log.user?.first_name || ""} {log.user?.last_name || ""}
                          </span>
                          <span className="text-slate-400 text-xs">
                            ({log.user?.email || log.user?.username || t("AuditLogs.unknown")})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <FileText size={16} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />
                          <span className="font-medium">{log.content_type || t("AuditLogs.notSpecified")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{log.description || t("AuditLogs.noDescription")}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                        {log.ip_address || t("AuditLogs.notAvailable")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <p className="font-medium">{t("AuditLogs.noLogs")}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users */}
        {statistics?.top_users && canAccess("audit.statistics") && (
          <div className="p-5 bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white pb-4 border-b border-slate-200 dark:border-slate-700">
              {t("AuditLogs.topUsers")}
            </h2>
            <div className="space-y-3">
              {statistics.top_users.slice(0, 5).map((user, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">#{index + 1}</span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {user.user__email || user.email || t("AuditLogs.unknown")}
                    </span>
                  </div>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">
                    {user.count} {t("AuditLogs.actionsCount")}
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

