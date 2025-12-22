import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchUniversityDetails,
  updateUniversityDetails,
  fetchFaculties,
  createFaculty,
  fetchPrograms,
  createProgram,
  fetchAcademicYears,
  createAcademicYear,
} from "../../../services/universityApi";

// جلب تفاصيل الجامعة
export const fetchUniversityAsync = createAsyncThunk(
  "university/fetchDetails",
  async (universityId, { rejectWithValue }) => {
    try {
      return await fetchUniversityDetails(universityId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في جلب بيانات الجامعة"
      );
    }
  }
);

// تحديث بيانات الجامعة
export const updateUniversityAsync = createAsyncThunk(
  "university/updateDetails",
  async ({ universityId, payload }, { rejectWithValue }) => {
    try {
      return await updateUniversityDetails(universityId, payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في تحديث بيانات الجامعة"
      );
    }
  }
);

// الكليات
export const fetchFacultiesAsync = createAsyncThunk(
  "university/fetchFaculties",
  async (universityId, { rejectWithValue }) => {
    try {
      return await fetchFaculties(universityId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في جلب الكليات"
      );
    }
  }
);

export const createFacultyAsync = createAsyncThunk(
  "university/createFaculty",
  async ({ universityId, payload }, { rejectWithValue }) => {
    try {
      return await createFaculty(universityId, payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في إنشاء الكلية"
      );
    }
  }
);

// البرامج
export const fetchProgramsAsync = createAsyncThunk(
  "university/fetchPrograms",
  async (universityId, { rejectWithValue }) => {
    try {
      return await fetchPrograms(universityId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في جلب البرامج الأكاديمية"
      );
    }
  }
);

export const createProgramAsync = createAsyncThunk(
  "university/createProgram",
  async ({ universityId, payload }, { rejectWithValue }) => {
    try {
      return await createProgram(universityId, payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في إنشاء البرنامج الأكاديمي"
      );
    }
  }
);

// السنوات الأكاديمية
export const fetchAcademicYearsAsync = createAsyncThunk(
  "university/fetchAcademicYears",
  async (universityId, { rejectWithValue }) => {
    try {
      return await fetchAcademicYears(universityId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في جلب السنوات الأكاديمية"
      );
    }
  }
);

export const createAcademicYearAsync = createAsyncThunk(
  "university/createAcademicYear",
  async ({ universityId, payload }, { rejectWithValue }) => {
    try {
      return await createAcademicYear(universityId, payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في إنشاء السنة الأكاديمية"
      );
    }
  }
);

const initialState = {
  university: null,
  faculties: [],
  programs: [],
  academicYears: [],
  loading: false,
  error: null,
};

const universitySlice = createSlice({
  name: "university",
  initialState,
  reducers: {
    clearUniversityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUniversityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUniversityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.university = action.payload || null;
      })
      .addCase(fetchUniversityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.university = null;
      })
      .addCase(updateUniversityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUniversityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.university = action.payload || state.university;
      })
      .addCase(updateUniversityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFacultiesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacultiesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.faculties = action.payload || [];
      })
      .addCase(fetchFacultiesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.faculties = [];
      })
      .addCase(createFacultyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFacultyAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.faculties.push(action.payload);
        }
      })
      .addCase(createFacultyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProgramsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgramsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload || [];
      })
      .addCase(fetchProgramsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.programs = [];
      })
      .addCase(createProgramAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProgramAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.programs.push(action.payload);
        }
      })
      .addCase(createProgramAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAcademicYearsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcademicYearsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.academicYears = action.payload || [];
      })
      .addCase(fetchAcademicYearsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.academicYears = [];
      })
      .addCase(createAcademicYearAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAcademicYearAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.academicYears.push(action.payload);
        }
      })
      .addCase(createAcademicYearAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUniversityError } = universitySlice.actions;

export default universitySlice.reducer;




