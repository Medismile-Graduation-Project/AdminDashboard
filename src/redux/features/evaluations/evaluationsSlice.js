import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchEvaluations,
  createEvaluation as createEvaluationApi,
  updateEvaluation as updateEvaluationApi,
  fetchEvaluationById,
  fetchStudentAverageRatings,
  submitEvaluation,
  finalizeEvaluation,
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
    // اسم المقيم (من evaluator object)
    name: apiEvaluation.evaluator ? getUserName(apiEvaluation.evaluator) : getEvaluatorName(apiEvaluation),
    // تاريخ التقييم
    date: formatDate(apiEvaluation.created_at),
    // التقييم (من 1-10 للتوافق مع النظام القديم، أو score 0-100 للنظام الجديد)
    rating: safeValue(apiEvaluation.rating, safeValue(apiEvaluation.score, 0) / 10), // تحويل score إلى rating للتوافق
    // Score (0-100) - النظام الجديد
    score: safeValue(apiEvaluation.score, safeValue(apiEvaluation.rating, 0) * 10), // تحويل rating إلى score للتوافق
    // عدد النجوم للعرض (تحويل من 1-10 إلى 1-5 أو من score)
    starRating: Math.round((safeValue(apiEvaluation.rating, safeValue(apiEvaluation.score, 0) / 10) / 10) * 5),
    // التعليق
    comment: safeValue(apiEvaluation.comment, ""),
    // نوع المقيم (للتوافق مع النظام القديم)
    evaluatorType: safeValue(apiEvaluation.evaluator_type, ""),
    // النظام الجديد: target_type, status
    target_type: safeValue(apiEvaluation.target_type, ""),
    target_id: safeValue(apiEvaluation.case_id || apiEvaluation.session_id || apiEvaluation.appointment_id),
    status: safeValue(apiEvaluation.status, "draft"), // draft, submitted, final
    rubric: safeValue(apiEvaluation.rubric, null), // JSON object
    // بيانات API الأصلية
    _apiData: {
      id: safeValue(apiEvaluation.id),
      evaluator: safeValue(apiEvaluation.evaluator),
      patient: safeValue(apiEvaluation.patient),
      student: safeValue(apiEvaluation.student),
      appointment: safeValue(apiEvaluation.appointment),
      case: safeValue(apiEvaluation.case),
      session: safeValue(apiEvaluation.session),
      rating: safeValue(apiEvaluation.rating),
      score: safeValue(apiEvaluation.score),
      comment: safeValue(apiEvaluation.comment),
      evaluator_type: safeValue(apiEvaluation.evaluator_type),
      target_type: safeValue(apiEvaluation.target_type),
      case_id: safeValue(apiEvaluation.case_id),
      session_id: safeValue(apiEvaluation.session_id),
      appointment_id: safeValue(apiEvaluation.appointment_id),
      rubric: safeValue(apiEvaluation.rubric),
      status: safeValue(apiEvaluation.status),
      created_at: safeValue(apiEvaluation.created_at),
      submitted_at: safeValue(apiEvaluation.submitted_at),
      finalized_at: safeValue(apiEvaluation.finalized_at),
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
      return createdEvaluation; // نعيد البيانات كما هي (قد تحتاج mapping لاحقاً)
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || error?.response?.data?.detail || "فشل في إنشاء التقييم"
      );
    }
  }
);

/**
 * تحديث تقييم (فقط المسودات)
 */
export const updateEvaluationAsync = createAsyncThunk(
  "evaluations/updateEvaluation",
  async ({ evaluationId, evaluationData }, { rejectWithValue }) => {
    try {
      const updated = await updateEvaluationApi(evaluationId, evaluationData);
      return updated;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في تحديث التقييم"
      );
    }
  }
);

/**
 * تقديم تقييم (Submit)
 */
export const submitEvaluationAsync = createAsyncThunk(
  "evaluations/submitEvaluation",
  async (evaluationId, { rejectWithValue }) => {
    try {
      const updated = await submitEvaluation(evaluationId);
      return updated;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في تقديم التقييم"
      );
    }
  }
);

/**
 * تثبيت تقييم (Finalize)
 */
export const finalizeEvaluationAsync = createAsyncThunk(
  "evaluations/finalizeEvaluation",
  async (evaluationId, { rejectWithValue }) => {
    try {
      const updated = await finalizeEvaluation(evaluationId);
      return updated;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في تثبيت التقييم"
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
      // تحديث تقييم
      .addCase(updateEvaluationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvaluationAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.reviews.findIndex((r) => r.id === updated.id);
        if (index !== -1) {
          state.reviews[index] = mapEvaluationFromApi(updated);
        }
        state.error = null;
      })
      .addCase(updateEvaluationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء تحديث التقييم";
      })
      // تقديم تقييم
      .addCase(submitEvaluationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitEvaluationAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.reviews.findIndex((r) => r.id === updated.id);
        if (index !== -1) {
          state.reviews[index] = mapEvaluationFromApi(updated);
        }
        state.error = null;
      })
      .addCase(submitEvaluationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء تقديم التقييم";
      })
      // تثبيت تقييم
      .addCase(finalizeEvaluationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finalizeEvaluationAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.reviews.findIndex((r) => r.id === updated.id);
        if (index !== -1) {
          state.reviews[index] = mapEvaluationFromApi(updated);
        }
        state.error = null;
      })
      .addCase(finalizeEvaluationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء تثبيت التقييم";
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
