import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../services/api";

// Async Thunks
export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/accounts/auth/login/", {
        email,
        password,
      });

      const { tokens, user } = response.data.data;

      // حفظ tokens في localStorage
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      // إرسال event لتحديث المكونات
      window.dispatchEvent(new Event("user-login"));

      return { tokens, user };
    } catch (error) {
      // معالجة الأخطاء حسب صيغة API الموحدة
      let errorMessage = "فشل تسجيل الدخول";
      
      if (error.response?.data) {
        // صيغة API الموحدة: { status: "error", message: "...", errors: {...} }
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
          errorMessage = Array.isArray(error.response.data.non_field_errors) 
            ? error.response.data.non_field_errors[0] 
            : error.response.data.non_field_errors;
        } else if (error.response.data.errors) {
          // معالجة errors object
          const errors = error.response.data.errors;
          if (typeof errors === 'object') {
            const firstError = Object.values(errors)[0];
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          } else {
            errorMessage = errors;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem("refresh_token");
    
    // محاولة تسجيل الخروج من API (اختياري - لا نمنع العملية إذا فشل)
    if (refreshToken) {
      try {
        await apiClient.post("/accounts/auth/logout/", {
          refresh: refreshToken,
        });
        console.log("✅ Logout API success");
      } catch (error) {
        // حتى لو فشل logout في API (500, 404, etc.)، نكمل عملية التنظيف المحلية
        console.warn("⚠️ Logout API error (continuing with local cleanup):", error.response?.status || error.message);
        // لا نرمي خطأ هنا - نكمل التنظيف المحلي
      }
    }

    // تنظيف localStorage دائماً (حتى لو فشل API)
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // إرسال event لتحديث المكونات
    window.dispatchEvent(new Event("user-logout"));

    // نعيد success دائماً لأننا نظفنا المحلي بنجاح
    return { success: true, message: "تم تسجيل الخروج بنجاح" };
  }
);

export const registerSupervisorAsync = createAsyncThunk(
  "auth/registerSupervisor",
  async (
    {
      username,
      email,
      password,
      password_confirm,
      first_name,
      last_name,
      university_id,
      license_number,
      specialization,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/accounts/supervisors/create/", {
        username,
        email,
        password,
        password_confirm,
        first_name,
        last_name,
        university_id,
        license_number,
        specialization,
      });

      return response.data.data;
    } catch (error) {
      // معالجة أفضل للأخطاء
      let errorMessage = "فشل إنشاء الحساب";
      
      if (error.response?.data) {
        // إذا كان هناك رسالة مباشرة
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        // إذا كان هناك أخطاء في الحقول
        else if (error.response.data.errors) {
          const errors = error.response.data.errors;
          if (typeof errors === 'object') {
            const firstError = Object.values(errors)[0];
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          } else {
            errorMessage = errors;
          }
        }
        // إذا كان هناك تفاصيل
        else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
        // إذا كان هناك قائمة أخطاء
        else if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data.map(err => 
            typeof err === 'string' ? err : Object.values(err)[0]
          ).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerCollegeAdminAsync = createAsyncThunk(
  "auth/registerCollegeAdmin",
  async (
    {
      username,
      email,
      password,
      password_confirm,
      first_name,
      last_name,
      university_id,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(
        "/accounts/university-admins/create/",
        {
          username,
          email,
          password,
          password_confirm,
          first_name,
          last_name,
          university_id,
        }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل إنشاء الحساب"
      );
    }
  }
);

export const refreshTokenAsync = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const response = await apiClient.post("/token/refresh/", {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      localStorage.setItem("access_token", newAccessToken);

      return newAccessToken;
    } catch (error) {
      // إذا فشل refresh، ننظف كل شيء
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("user-logout"));
      
      return rejectWithValue("فشل تجديد الـ token");
    }
  }
);

// Initial State
const initialState = {
  user: null,
  tokens: {
    access: null,
    refresh: null,
  },
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.isAuthenticated = false;
      state.error = null;
    },
    setTokens: (state, action) => {
      state.tokens = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.tokens = { access: null, refresh: null };
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        // حتى لو رُفض، ننظف state لأن التنظيف المحلي تم في logoutAsync
        state.loading = false;
        state.user = null;
        state.tokens = { access: null, refresh: null };
        state.isAuthenticated = false;
        // لا نعرض خطأ للمستخدم لأن التنظيف المحلي نجح
        state.error = null;
      });

    // Register Supervisor
    builder
      .addCase(registerSupervisorAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerSupervisorAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerSupervisorAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register College Admin
    builder
      .addCase(registerCollegeAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCollegeAdminAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerCollegeAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Refresh Token
    builder
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.tokens.access = action.payload;
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        state.user = null;
        state.tokens = { access: null, refresh: null };
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearAuth, setTokens } = authSlice.actions;
export default authSlice.reducer;

