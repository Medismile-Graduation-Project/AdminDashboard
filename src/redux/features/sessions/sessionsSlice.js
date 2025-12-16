import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    id: "MS-2024-001",
    student: "فاطمة الزهراء",
    patient: "خالد",
    status: "قيد التقدم",
    progress: 75,
    elapsed: "00:45:30",
  },
  {
    id: "MS-2024-002",
    student: "أحمد كمال",
    patient: "سارة محمود",
    status: "متوقفة مؤقتاً",
    progress: 30,
    elapsed: "00:20:15",
  },
];

const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    addSession: (state, action) => {
      state.push(action.payload);
    },
    updateSession: (state, action) => {
      const index = state.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state[index] = action.payload;
    },
    deleteSession: (state, action) => {
      return state.filter((s) => s.id !== action.payload);
    },
  },
});

export const { addSession, updateSession, deleteSession } =
  sessionsSlice.actions;
export default sessionsSlice.reducer;
