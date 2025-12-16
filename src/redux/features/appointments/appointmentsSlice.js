import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAppointments } from "../../../services/appointmentsApi";

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
 * بناءً على التوثيق الكامل لـ Appointment API
 * الحقول من API: id, patient, user, case, appointment_date, status, is_archived
 */
const mapAppointmentFromApi = (apiAppointment) => {
  if (!apiAppointment) {
    return null;
  }
  
  // Helper function لمعالجة null/undefined
  const safeValue = (value, defaultValue = null) => {
    return value !== null && value !== undefined ? value : defaultValue;
  };
  
  // حساب المدة بالدقائق (إذا كان هناك start_datetime و end_datetime)
  const calculateDuration = (start, end) => {
    if (!start || !end) return null;
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
      const diffMs = endDate - startDate;
      return Math.round(diffMs / (1000 * 60)); // تحويل إلى دقائق
    } catch {
      return null;
    }
  };
  
  // دعم الحقول المختلفة من API
  // API قد يعيد appointment_date أو start_datetime/end_datetime
  const appointmentDate = safeValue(apiAppointment.appointment_date) || safeValue(apiAppointment.start_datetime);
  const startDateTime = safeValue(apiAppointment.start_datetime) || appointmentDate;
  const endDateTime = safeValue(apiAppointment.end_datetime);
  
  // دعم user أو student (حسب API)
  const userObj = safeValue(apiAppointment.user) || safeValue(apiAppointment.student);
  
  return {
    id: safeValue(apiAppointment.id),
    // معلومات الموعد الأساسية
    title: safeValue(apiAppointment.title, ""),
    description: safeValue(apiAppointment.description, ""),
    appointment_type: safeValue(apiAppointment.appointment_type, ""),
    // معلومات المريض (nested User object)
    patient: safeValue(apiAppointment.patient, null),
    patient_name: getUserName(apiAppointment.patient),
    // معلومات المستخدم/الطالب (nested User object)
    // API قد يعيد user أو student
    user: userObj,
    student: userObj, // للتوافق مع الكود الموجود
    student_name: getUserName(userObj),
    // معلومات الحالة السريرية (nested Case object)
    case: safeValue(apiAppointment.case, null),
    case_title: (apiAppointment.case && apiAppointment.case.title) ? apiAppointment.case.title : "-",
    case_id: (apiAppointment.case && apiAppointment.case.id) ? apiAppointment.case.id : null,
    // أوقات الموعد - دعم الحقول المختلفة
    appointment_date: appointmentDate,
    start_datetime: startDateTime,
    end_datetime: endDateTime,
    // حساب المدة من الأوقات
    duration_minutes: calculateDuration(startDateTime, endDateTime),
    // معلومات إضافية
    location: safeValue(apiAppointment.location, ""),
    notes: safeValue(apiAppointment.notes, ""),
    status: safeValue(apiAppointment.status, ""),
    is_archived: safeValue(apiAppointment.is_archived, false),
    // الحقول التاريخية
    created_at: safeValue(apiAppointment.created_at),
    updated_at: safeValue(apiAppointment.updated_at),
  };
};

/**
 * جلب جميع المواعيد من API
 */
export const fetchAppointmentsAsync = createAsyncThunk(
  "appointments/fetchAppointments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await fetchAppointments(params);
      
      // تسجيل البيانات للتحقق (في وضع التطوير فقط)
      if (process.env.NODE_ENV === "development") {
        console.log("📅 Appointments API Response:", data);
        console.log("📅 Number of appointments:", data?.length || 0);
        if (data && data.length > 0) {
          console.log("📅 First appointment sample:", data[0]);
        }
      }
      
      // تحويل كل موعد باستخدام دالة mapping
      if (Array.isArray(data)) {
        const mapped = data.map(mapAppointmentFromApi).filter(Boolean);
        
        if (process.env.NODE_ENV === "development") {
          console.log("📅 Mapped appointments:", mapped.length);
        }
        
        return mapped;
      }
      
      return [];
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "فشل في جلب المواعيد"
      );
    }
  }
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState: {
    appointments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // جلب المواعيد
      .addCase(fetchAppointmentsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload || [];
        state.error = null;
      })
      .addCase(fetchAppointmentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ أثناء جلب المواعيد";
        state.appointments = [];
      });
  },
});

export const { clearError } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;