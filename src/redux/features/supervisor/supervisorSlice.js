// store/supervisorSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  students: [
    { id: 1, name: "محمد أحمد" },
    { id: 2, name: "أحمد محمود" },
    { id: 3, name: "ليلى خالد" },
  ],
  selectedStudent: null,
  messages: [],
};

const supervisorSlice = createSlice({
  name: "supervisor",
  initialState,
  reducers: {
    selectStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
    sendMessage: (state, action) => {
      state.messages.push({
        from: "supervisor",
        text: action.payload.text,
        type: action.payload.type || "normal",
      });
    },
    uploadFiles: (state, action) => {
      action.payload.forEach((file) => {
        state.messages.push({
          from: "supervisor",
          type: "file",
          fileName: file.fileName,
          fileType: file.fileType,
          fileUrl: file.fileUrl,
        });
      });
    },
  },
});

export const { selectStudent, sendMessage, uploadFiles } =
  supervisorSlice.actions;

export default supervisorSlice.reducer;
