import { configureStore } from "@reduxjs/toolkit";
import studentsReducer from "./features/students/studentsSlice";
import clinicalCasesReducer from "./features/clinicalCases/clinicalCasesSlice";
import supervisorReducer from "./features/supervisor/supervisorSlice";
import evaluationsReducer from "./features/evaluations/evaluationsSlice";
import patientsReducer from "./features/patients/patientsSlice";
import treatmentsReducer from "./features/treatments/treatmentsSlice";
import appointmentsReducer from "./features/appointments/appointmentsSlice";
import sessionsReducer from "./features/sessions/sessionsSlice";
import mediContentReducer from "./features/mediContent/mediContentSlice";
import reportsReducer from "./features/reports/reportsSlice";
import notificationsReducer from "./features/notifications/notificationsSlice";
import themeReducer from "./features/theme/themeSlice";



export const store = configureStore({
  reducer: {
    students: studentsReducer,
    clinicalCases: clinicalCasesReducer,
    supervisor: supervisorReducer,
    evaluations: evaluationsReducer,
    patients: patientsReducer,
    treatments: treatmentsReducer,
    appointments: appointmentsReducer,
    sessions: sessionsReducer,
    mediContent: mediContentReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
  },
});

export default store;
