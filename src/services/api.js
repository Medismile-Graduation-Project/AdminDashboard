import axios from "axios";

// Base URL للـ API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://medismile1-production.up.railway.app/api/v1";

// إنشاء axios instance مع الإعدادات الافتراضية
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// لا نضيف interceptor للـ token لأن المصادقة غير مفعلة

// إضافة interceptor للتعامل مع الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // معالجة أخطاء 401 (غير مصرح)
    if (error.response?.status === 401) {
      // يمكن إضافة منطق إعادة التوجيه للصفحة login هنا
      console.error("Unauthorized - Token may be expired or invalid");
    }
    
    // معالجة أخطاء 403 (ممنوع)
    if (error.response?.status === 403) {
      console.error("Forbidden - You don't have permission to access this resource");
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
