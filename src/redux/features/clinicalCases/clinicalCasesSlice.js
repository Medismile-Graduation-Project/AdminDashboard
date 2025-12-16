import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as casesApi from "../../../services/casesApi";

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
  if (user.name) return user.name;
  if (user.email) return user.email;
  return "-";
};

/**
 * Mapping function لتحويل بيانات API إلى تنسيق مناسب للـ Frontend
 * بناءً على التوثيق الكامل لـ Case API
 * الحقول الصحيحة: id, title, description, patient, student, supervisor, 
 * status, priority, is_public, created_at, updated_at
 */
const mapCaseFromApi = (apiCase) => {
  if (!apiCase) {
    return null;
  }
  
  // Helper function لمعالجة null/undefined
  const safeValue = (value, defaultValue = null) => {
    return value !== null && value !== undefined ? value : defaultValue;
  };
  
  return {
    id: safeValue(apiCase.id),
    // معلومات الحالة الأساسية
    title: safeValue(apiCase.title, ""),
    description: safeValue(apiCase.description, ""),
    // معلومات المريض (nested User object)
    patient: safeValue(apiCase.patient, null),
    patient_name: getUserName(apiCase.patient),
    patient_id: apiCase.patient?.id || apiCase.patient || null,
    // معلومات الطالب (nested User object)
    student: safeValue(apiCase.student, null),
    student_name: getUserName(apiCase.student),
    student_id: apiCase.student?.id || apiCase.student || null,
    // معلومات المشرف (nested User object)
    supervisor: safeValue(apiCase.supervisor, null),
    supervisor_name: getUserName(apiCase.supervisor),
    supervisor_id: apiCase.supervisor?.id || apiCase.supervisor || null,
    // حالة وأولوية الحالة
    status: safeValue(apiCase.status, "open"),
    priority: safeValue(apiCase.priority, "medium"),
    is_public: safeValue(apiCase.is_public, false),
    // التاريخ والسجل
    history: Array.isArray(apiCase.history) ? apiCase.history : [],
    assignment_requests: Array.isArray(apiCase.assignment_requests) ? apiCase.assignment_requests : [],
    // الحقول التاريخية
    created_at: safeValue(apiCase.created_at),
    updated_at: safeValue(apiCase.updated_at),
  };
};

/**
 * Mapping function لتحويل بيانات Frontend إلى تنسيق API للإنشاء
 * بناءً على CaseCreateSerializer
 * الحقول المسموحة: title, description, priority, is_public, patient_id
 * ملاحظة: لا يمكن إضافة student أو supervisor مباشرة عند الإنشاء
 */
const mapCaseToApiForCreate = (frontendCase) => {
  const apiData = {
    title: frontendCase.title || "",
    description: frontendCase.description || "",
    priority: frontendCase.priority || "medium",
    is_public: frontendCase.is_public || false,
  };
  
  // إضافة patient_id إذا كان موجوداً (مطلوب عند تعطيل المصادقة)
  if (frontendCase.patient_id) {
    apiData.patient_id = frontendCase.patient_id;
  }
  
  // لا يمكن إضافة student_id أو supervisor_id عند الإنشاء
  // يتم الإسناد لاحقاً عبر طلبات الإسناد
  
  return apiData;
};

/**
 * Mapping function لتحويل بيانات Frontend إلى تنسيق API للتحديث
 * بناءً على CaseUpdateSerializer
 * الحقول المسموحة فقط: title, description, status, priority, is_public
 * ملاحظة: لا يمكن تحديث patient_id, student_id, supervisor_id مباشرة
 * يتم الإسناد عبر طلبات الإسناد وإجراءات المشرف
 */
const mapCaseToApiForUpdate = (frontendCase) => {
  const updateData = {};
  
  if (frontendCase.title !== undefined) updateData.title = frontendCase.title;
  if (frontendCase.description !== undefined) updateData.description = frontendCase.description;
  if (frontendCase.status !== undefined) updateData.status = frontendCase.status;
  if (frontendCase.priority !== undefined) updateData.priority = frontendCase.priority;
  if (frontendCase.is_public !== undefined) updateData.is_public = frontendCase.is_public;
  
  // لا يمكن تحديث patient_id, student_id, supervisor_id مباشرة
  // يتم الإسناد عبر طلبات الإسناد وإجراءات المشرف
  
  return updateData;
};

// Async Thunks
export const fetchCases = createAsyncThunk(
  "cases/fetchCases",
  async (_, { rejectWithValue }) => {
    try {
      const data = await casesApi.fetchCases();
      
      // البيانات تأتي كـ array من Case objects
      if (Array.isArray(data)) {
        return data.map(mapCaseFromApi).filter(c => c !== null);
      }
      
      return [];
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData || error.message || "فشل في جلب الحالات";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCaseById = createAsyncThunk(
  "cases/fetchCaseById",
  async (caseId, { rejectWithValue }) => {
    try {
      const data = await casesApi.fetchCaseById(caseId);
      return mapCaseFromApi(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCase = createAsyncThunk(
  "cases/createCase",
  async (caseData, { rejectWithValue }) => {
    try {
      const apiData = mapCaseToApiForCreate(caseData);
      const response = await casesApi.createCase(apiData);
      
      // الاستجابة من API تأتي كـ Case object
      return mapCaseFromApi(response);
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.errors || errorData || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCase = createAsyncThunk(
  "cases/updateCase",
  async ({ caseId, ...caseData }, { rejectWithValue }) => {
    try {
      const apiData = mapCaseToApiForUpdate(caseData);
      const response = await casesApi.updateCase(caseId, apiData);
      
      // الاستجابة من API تأتي كـ Case object محدث
      return mapCaseFromApi(response);
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.errors || errorData || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCase = createAsyncThunk(
  "cases/deleteCase",
  async (caseId, { rejectWithValue }) => {
    try {
      await casesApi.deleteCase(caseId);
      return caseId;
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * جلب طلبات الإسناد لحالة محددة
 */
export const fetchAssignmentRequestsAsync = createAsyncThunk(
  "cases/fetchAssignmentRequests",
  async (caseId, { rejectWithValue }) => {
    try {
      const data = await casesApi.fetchAssignmentRequests(caseId);
      return { caseId, requests: Array.isArray(data) ? data : [] };
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * إنشاء طلب إسناد
 */
export const createAssignmentRequestAsync = createAsyncThunk(
  "cases/createAssignmentRequest",
  async ({ caseId, message, studentId }, { rejectWithValue }) => {
    try {
      const payload = { message };
      // إذا كان المشرف يحدد طالباً صراحةً
      if (studentId) payload.student_id = studentId;
      const data = await casesApi.requestCaseAssignment(caseId, payload);
      return { caseId, request: data };
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.errors || errorData || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * إجراء المشرف (قبول/رفض طلب إسناد)
 */
export const supervisorCaseActionAsync = createAsyncThunk(
  "cases/supervisorCaseAction",
  async ({ caseId, action, studentId, message, userId }, { rejectWithValue }) => {
    try {
      const data = await casesApi.supervisorCaseAction(caseId, {
        action,
        student_id: studentId,
        message,
        user_id: userId,
      });
      return { caseId, caseData: mapCaseFromApi(data) };
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.errors || errorData || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

const clinicalCasesSlice = createSlice({
  name: "clinicalCases",
  initialState: {
    cases: [],
    selectedCase: null,
    assignmentRequests: {}, // { caseId: [requests] }
    loading: false,
    loadingSelected: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCase: (state, action) => {
      state.selectedCase = action.payload;
    },
    clearSelectedCase: (state) => {
      state.selectedCase = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCases
      .addCase(fetchCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.cases = action.payload || [];
        state.error = null;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cases = [];
      })
      // fetchCaseById
      .addCase(fetchCaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.cases.findIndex((c) => c.id === action.payload.id);
          if (index !== -1) {
            state.cases[index] = action.payload;
          } else {
            state.cases.push(action.payload);
          }
        }
        state.error = null;
      })
      .addCase(fetchCaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createCase
      .addCase(createCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCase.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.cases.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateCase
      .addCase(updateCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCase.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.cases.findIndex((c) => c.id === action.payload.id);
          if (index !== -1) {
            state.cases[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteCase
      .addCase(deleteCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCase.fulfilled, (state, action) => {
        state.loading = false;
        state.cases = state.cases.filter((c) => c.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchAssignmentRequestsAsync
      .addCase(fetchAssignmentRequestsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentRequestsAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { caseId, requests } = action.payload;
        state.assignmentRequests[caseId] = requests;
        state.error = null;
      })
      .addCase(fetchAssignmentRequestsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createAssignmentRequestAsync
      .addCase(createAssignmentRequestAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignmentRequestAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { caseId, request } = action.payload;
        if (!state.assignmentRequests[caseId]) {
          state.assignmentRequests[caseId] = [];
        }
        state.assignmentRequests[caseId].push(request);
        // تحديث الحالة المحددة إذا كانت موجودة
        if (state.selectedCase && state.selectedCase.id === caseId) {
          state.selectedCase = { ...state.selectedCase, assignment_requests: [...(state.selectedCase.assignment_requests || []), request] };
        }
        state.error = null;
      })
      .addCase(createAssignmentRequestAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // supervisorCaseActionAsync
      .addCase(supervisorCaseActionAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(supervisorCaseActionAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { caseId, caseData } = action.payload;
        // تحديث الحالة في القائمة
        const index = state.cases.findIndex((c) => c.id === caseId);
        if (index !== -1) {
          state.cases[index] = caseData;
        }
        // تحديث الحالة المحددة
        if (state.selectedCase && state.selectedCase.id === caseId) {
          state.selectedCase = caseData;
        }
        state.error = null;
      })
      .addCase(supervisorCaseActionAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedCase, clearSelectedCase } = clinicalCasesSlice.actions;
export default clinicalCasesSlice.reducer;
