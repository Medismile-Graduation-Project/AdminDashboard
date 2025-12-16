import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchEvaluations,
  createEvaluation as createEvaluationApi,
  fetchEvaluationById,
  fetchStudentAverageRatings,
} from "../../../services/evaluationsApi";

/**
 * دالة مساعدة لاستخراج اسم المستخدم من User object
 */
const getUserName = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;
  
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  if (firstName) return firstName;
  if (user.username) return user.username;
  if (user.email) return user.email;
  return "-";
};

/**
 * Mapping function لتحويل بيانات API إلى تنسيق مناسب للـ Frontend
 */
const mapEvaluationFromApi = (apiEvaluation) => {
  if (!apiEvaluation) {
    return null;
  }
  
  // Helper function لمعالجة null/undefined
  const safeValue = (value, defaultValue = null) => {
    return value !== null && value !== undefined ? value : defaultValue;
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };
  
  // تحديد اسم المقيم بناءً على evaluator_type
  const getEvaluatorName = (evaluation) => {
    if (evaluation.evaluator_type === "patient" && evaluation.patient) {
      return getUserName(evaluation.patient);
    }
    if (evaluation.evaluator_type === "supervisor" && evaluation.supervisor) {
      return getUserName(evaluation.supervisor);
    }
    if (evaluation.evaluator_type === "student" && evaluation.student) {
      return getUserName(evaluation.student);
    }
    return "غير معروف";
  };
  
  return {
    id: safeValue(apiEvaluation.id),
    // اسم المقيم
    name: getEvaluatorName(apiEvaluation),
    // تاريخ التقييم
    date: formatDate(apiEvaluation.created_at),
    // التقييم (من 1-10، نحوله إلى 5 نجوم)
    rating: safeValue(apiEvaluation.rating, 0),
    // عدد النجوم للعرض (تحويل من 1-10 إلى 1-5)
    starRating: Math.round((safeValue(apiEvaluation.rating, 0) / 10) * 5),
    // التعليق
    comment: safeValue(apiEvaluation.comment, ""),
    // نوع المقيم
    evaluatorType: safeValue(apiEvaluation.evaluator_type, ""),
    // حالة التقييم (new/reviewed - سنستخدم evaluator_type كحالة مؤقتاً)
    status: "new", // يمكن تحسينه لاحقاً بناءً على منطق إضافي
    // بيانات API الأصلية
    _apiData: {
      id: safeValue(apiEvaluation.id),
      patient: safeValue(apiEvaluation.patient),
      student: safeValue(apiEvaluation.student),
      appointment: safeValue(apiEvaluation.appointment),
      rating: safeValue(apiEvaluation.rating),
      comment: safeValue(apiEvaluation.comment),
      evaluator_type: safeValue(apiEvaluation.evaluator_type),
      created_at: safeValue(apiEvaluation.created_at),
    },
  };
};

/**
 * جلب جميع التقييمات من API
 */
export const fetchEvaluationsAsync = createAsyncThunk(
  "evaluations/fetchEvaluations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchEvaluations(params);
      
      // تحويل كل تقييم باستخدام دالة mapping
      if (Array.isArray(data)) {
        return data.map(mapEvaluationFromApi).filter(Boolean);
      }
      
      return [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في جلب التقييمات"
      );
    }
  }
);

/**
 * إنشاء تقييم جديد
 */
export const createEvaluationAsync = createAsyncThunk(
  "evaluations/createEvaluation",
  async (evaluationData, { rejectWithValue }) => {
    try {
      const createdEvaluation = await createEvaluationApi(evaluationData);
      return mapEvaluationFromApi(createdEvaluation);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في إنشاء التقييم"
      );
    }
  }
);

/**
 * جلب متوسط تقييمات طالب
 */
export const fetchStudentAverageRatingsAsync = createAsyncThunk(
  "evaluations/fetchStudentAverageRatings",
  async (studentId, { rejectWithValue }) => {
    try {
      const data = await fetchStudentAverageRatings(studentId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في جلب متوسط التقييمات"
      );
    }
  }
);

const evaluationsSlice = createSlice({
  name: "evaluations",
  initialState: {
    reviews: [], // قائمة التقييمات
    averageRatings: null, // متوسط التقييمات (لطالب معين)
    loading: false,
    error: null,
    search: "",
    statusFilter: "all",
    dateFilter: "",
    evaluatorTypeFilter: "all", // فلتر نوع المقيم
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setDateFilter: (state, action) => {
      state.dateFilter = action.payload;
    },
    setEvaluatorTypeFilter: (state, action) => {
      state.evaluatorTypeFilter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // جلب التقييمات
      .addCase(fetchEvaluationsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvaluationsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload || [];
        state.error = null;
      })
      .addCase(fetchEvaluationsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء جلب التقييمات";
        state.reviews = [];
      })
      // إنشاء تقييم
      .addCase(createEvaluationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvaluationAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.reviews.unshift(action.payload); // إضافة في البداية
        }
        state.error = null;
      })
      .addCase(createEvaluationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء إنشاء التقييم";
      })
      // جلب متوسط التقييمات
      .addCase(fetchStudentAverageRatingsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAverageRatingsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.averageRatings = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentAverageRatingsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء جلب متوسط التقييمات";
      });
  },
});

export const {
  setSearch,
  setStatusFilter,
  setDateFilter,
  setEvaluatorTypeFilter,
  clearError,
} = evaluationsSlice.actions;

export default evaluationsSlice.reducer;
