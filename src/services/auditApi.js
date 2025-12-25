import apiClient from "./api";

/**
 * API service لسجلات التدقيق (Audit Logs)
 * بناءً على توثيق Backend API
 */

const AUDIT_BASE_URL = "/audit/logs/";

/**
 * جلب سجلات التدقيق
 * GET /audit/logs/
 * Query Parameters: user_id, action, content_type, start_date, end_date, search
 * يعيد: Array of audit logs أو {status: "success", data: [...]}
 */
export const fetchAuditLogs = async (params = {}) => {
  try {
    const response = await apiClient.get(AUDIT_BASE_URL, { params });

    // الاستجابة قد تأتي بصيغ مختلفة:
    // 1. {status: "success", message: "...", data: [...]}
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // 2. Array مباشر
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // 3. {results: [...]} (pagination)
    if (response.data?.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }

    console.warn("Unexpected audit logs API response format:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

/**
 * جلب إحصائيات سجلات التدقيق
 * GET /audit/statistics/
 * يعيد: {action_counts: [...], top_users: [...], daily_activity: [...]}
 * 
 * ملاحظة: إذا فشل الطلب (500)، نعيد قيم افتراضية بدلاً من رمي خطأ
 */
export const fetchAuditStatistics = async (params = {}) => {
  try {
    const response = await apiClient.get("/audit/statistics/", { params });

    if (response.data?.data) {
      return response.data.data;
    }

    return response.data;
  } catch (error) {
    // إذا كان الخطأ 500 أو خطأ من الخادم، نعيد قيم افتراضية
    if (error?.response?.status === 500 || error?.response?.status >= 500) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ Audit statistics API returned 500, using default values");
      }
      return {
        action_counts: [],
        top_users: [],
        daily_activity: [],
      };
    }
    
    // للأخطاء الأخرى، نطبع في development فقط
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching audit statistics:", error);
    }
    
    // نعيد قيم افتراضية بدلاً من رمي الخطأ
    return {
      action_counts: [],
      top_users: [],
      daily_activity: [],
    };
  }
};

/**
 * جلب تفاصيل سجل تدقيق محدد
 * GET /audit/logs/<log_id>/
 */
export const fetchAuditLogById = async (logId) => {
  try {
    const response = await apiClient.get(`${AUDIT_BASE_URL}${logId}/`);

    if (response.data?.data) {
      return response.data.data;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching audit log:", error);
    throw error;
  }
};


