import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchReports,
  fetchReportById,
  createReport,
  updateReport,
  deleteReport,
  fetchStudentReports,
  fetchUniversityReports,
} from "../../../services/reportsApi";

/**
 * جلب قائمة التقارير
 */
export const fetchReportsAsync = createAsyncThunk(
  "reports/fetchReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchReports(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في جلب التقارير"
      );
    }
  }
);

/**
 * جلب تقرير محدد
 */
export const fetchReportByIdAsync = createAsyncThunk(
  "reports/fetchReportById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchReportById(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في جلب التقرير"
      );
    }
  }
);

/**
 * إنشاء تقرير جديد
 */
export const createReportAsync = createAsyncThunk(
  "reports/createReport",
  async (reportData, { rejectWithValue }) => {
    try {
      const data = await createReport(reportData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في إنشاء التقرير"
      );
    }
  }
);

/**
 * تحديث تقرير
 */
export const updateReportAsync = createAsyncThunk(
  "reports/updateReport",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updated = await updateReport(id, data);
      return updated;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في تحديث التقرير"
      );
    }
  }
);

/**
 * حذف تقرير
 */
export const deleteReportAsync = createAsyncThunk(
  "reports/deleteReport",
  async (id, { rejectWithValue }) => {
    try {
      await deleteReport(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في حذف التقرير"
      );
    }
  }
);

/**
 * جلب تقارير طالب محدد
 */
export const fetchStudentReportsAsync = createAsyncThunk(
  "reports/fetchStudentReports",
  async (studentId, { rejectWithValue }) => {
    try {
      const data = await fetchStudentReports(studentId);
      return { studentId, reports: data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في جلب تقارير الطالب"
      );
    }
  }
);

/**
 * جلب تقارير جامعة محددة
 */
export const fetchUniversityReportsAsync = createAsyncThunk(
  "reports/fetchUniversityReports",
  async (universityId, { rejectWithValue }) => {
    try {
      const data = await fetchUniversityReports(universityId);
      return { universityId, reports: data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في جلب تقارير الجامعة"
      );
    }
  }
);

const initialState = {
  // قائمة التقارير من API
  reports: [],
  // التقرير المحدد
  selectedReport: null,
  // تقارير الطلاب (مخزنة حسب studentId)
  studentReports: {},
  // تقارير الجامعات (مخزنة حسب universityId)
  universityReports: {},
  // حالة التحميل
  loading: false,
  // حالة التحميل للتقرير المحدد
  loadingSelected: false,
  // الأخطاء
  error: null,
  // معاملات البحث
  filters: {
    student_id: null,
    university_id: null,
    report_type: null,
    is_active: null,
  },
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    // مسح الخطأ
    clearError: (state) => {
      state.error = null;
    },
    // مسح التقرير المحدد
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
    // تحديث الفلاتر
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // مسح الفلاتر
    clearFilters: (state) => {
      state.filters = {
        student_id: null,
        university_id: null,
        report_type: null,
        is_active: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // جلب قائمة التقارير
      .addCase(fetchReportsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload || [];
        state.error = null;
      })
      .addCase(fetchReportsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء جلب التقارير";
        state.reports = [];
      })
      // جلب تقرير محدد
      .addCase(fetchReportByIdAsync.pending, (state) => {
        state.loadingSelected = true;
        state.error = null;
      })
      .addCase(fetchReportByIdAsync.fulfilled, (state, action) => {
        state.loadingSelected = false;
        state.selectedReport = action.payload;
        state.error = null;
      })
      .addCase(fetchReportByIdAsync.rejected, (state, action) => {
        state.loadingSelected = false;
        state.error = action.payload || "حدث خطأ أثناء جلب التقرير";
        state.selectedReport = null;
      })
      // إنشاء تقرير جديد
      .addCase(createReportAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReportAsync.fulfilled, (state, action) => {
        state.loading = false;
        // إضافة التقرير الجديد للقائمة
        if (action.payload) {
          state.reports.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createReportAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء إنشاء التقرير";
      })
      // تحديث تقرير
      .addCase(updateReportAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReportAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        // تحديث في القائمة
        const index = state.reports.findIndex((item) => item.id === updated.id);
        if (index !== -1) {
          state.reports[index] = updated;
        }
        // تحديث التقرير المحدد إذا كان نفسه
        if (state.selectedReport?.id === updated.id) {
          state.selectedReport = updated;
        }
        state.error = null;
      })
      .addCase(updateReportAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء تحديث التقرير";
      })
      // حذف تقرير
      .addCase(deleteReportAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReportAsync.fulfilled, (state, action) => {
        state.loading = false;
        // حذف من القائمة
        state.reports = state.reports.filter((item) => item.id !== action.payload);
        // مسح التقرير المحدد إذا كان المحذوف
        if (state.selectedReport?.id === action.payload) {
          state.selectedReport = null;
        }
        state.error = null;
      })
      .addCase(deleteReportAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء حذف التقرير";
      })
      // جلب تقارير طالب
      .addCase(fetchStudentReportsAsync.fulfilled, (state, action) => {
        const { studentId, reports } = action.payload;
        state.studentReports[studentId] = reports;
      })
      // جلب تقارير جامعة
      .addCase(fetchUniversityReportsAsync.fulfilled, (state, action) => {
        const { universityId, reports } = action.payload;
        state.universityReports[universityId] = reports;
      });
  },
});

export const {
  clearError,
  clearSelectedReport,
  setFilters,
  clearFilters,
} = reportsSlice.actions;

export default reportsSlice.reducer;
