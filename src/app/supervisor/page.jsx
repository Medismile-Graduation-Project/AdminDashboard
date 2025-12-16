"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Send,
  Paperclip,
  Search,
  AlertTriangle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import {
  selectStudent,
  sendMessage,
  uploadFiles,
} from "../../redux/features/supervisor/supervisorSlice";

export default function SupervisorPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { students, selectedStudent, messages } = useSelector(
    (state) => state.supervisor
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"

  // إرسال رسالة
  const handleSend = (type = "normal") => {
    if (newMessage.trim() === "") return;
    dispatch(sendMessage({ text: newMessage, type }));
    setNewMessage("");
  };

  // رفع ملفات
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = files.map((file) => ({
      fileName: file.name,
      fileType: file.type,
      fileUrl: URL.createObjectURL(file),
    }));

    dispatch(uploadFiles(newFiles));
  };

  // 🔍 فلترة الطلاب
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // اختيار طالب
  const handleSelectStudent = (student) => {
    dispatch(selectStudent(student));
    setMobileView("chat");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen">
      {/* القائمة الجانبية */}
      <div
        className={`w-full md:w-1/4 bg-white dark:bg-slate-800 shadow rounded-2xl p-4 md:block border border-sky-200 dark:border-slate-700 ${
          mobileView === "chat" ? "hidden" : "block"
        }`}
      >
        <h2 className="font-bold mb-2 text-blue-900 dark:text-white">
          {t("supervisor.students")}
        </h2>
        <div className="flex items-center gap-2 mb-4 border border-sky-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("supervisor.search_students")}
            className="flex-1 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-transparent transition"
          />
        </div>
        <ul className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <li className="text-slate-500 dark:text-slate-400">{t("supervisor.no_messages")}</li>
          ) : (
            filteredStudents.map((student) => (
              <li
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className={`cursor-pointer p-2 rounded-lg transition text-slate-700 dark:text-slate-300 ${
                  selectedStudent?.id === student.id
                    ? "bg-blue-100 dark:bg-blue-900/30 font-semibold"
                    : "hover:bg-sky-50 dark:hover:bg-slate-700"
                }`}
              >
                {student.name}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* المحادثة */}
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-slate-800 shadow rounded-2xl p-4 border border-sky-200 dark:border-slate-700 ${
          mobileView === "list" ? "hidden md:flex" : "flex"
        }`}
      >
        {/* زر رجوع للموبايل */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setMobileView("list")}
            className="md:hidden p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
          <h2 className="font-bold text-blue-900 dark:text-white">
            {t("supervisor.chat_with")} {selectedStudent?.name || ""}
          </h2>
        </div>

        {/* الرسائل */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 border border-sky-200 dark:border-slate-700 rounded-lg p-2 bg-sky-50 dark:bg-slate-900 max-h-[calc(100vh-250px)]">
          {messages.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">{t("supervisor.no_messages")}</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-xs break-words transition ${
                  msg.from === "supervisor"
                    ? msg.type === "alert"
                      ? "bg-red-500 text-white self-end text-right"
                      : msg.type === "note"
                      ? "bg-yellow-300 dark:bg-yellow-600 text-slate-900 dark:text-white self-end text-right"
                      : msg.type === "instruction"
                      ? "bg-green-500 text-white self-end text-right"
                      : msg.type === "file"
                      ? "bg-sky-100 dark:bg-slate-700 text-slate-900 dark:text-white self-end text-right"
                      : "bg-blue-100 dark:bg-blue-900/30 text-slate-900 dark:text-white self-end text-right"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white self-start text-left"
                }`}
              >
                {msg.type === "file" ? (
                  <div>
                    <p className="font-semibold">{msg.fileName}</p>
                    {msg.fileType.startsWith("image/") ? (
                      <img
                        src={msg.fileUrl}
                        alt={msg.fileName}
                        className="mt-2 max-h-40 rounded-lg"
                      />
                    ) : (
                      <a
                        href={msg.fileUrl}
                        download={msg.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-blue-dark)] underline hover:text-[var(--color-blue-dark)]/80"
                      >
                        {t("supervisor.download_file")}
                      </a>
                    )}
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))
          )}
        </div>

        {/* كتابة رسالة + رفع ملفات */}
        <div className="flex items-center gap-2 border-t pt-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("supervisor.write_message")}
            className="flex-1 border border-sky-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-800 transition focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <label className="p-2 bg-sky-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-sky-100 dark:hover:bg-slate-600 transition">
            <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={() => handleSend("normal")}
            className="p-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* أزرار إضافية */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => handleSend("instruction")}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition"
          >
            {t("supervisor.send_instruction")}
          </button>
          <button
            onClick={() => handleSend("alert")}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg flex items-center gap-1 transition"
          >
            <AlertTriangle className="w-4 h-4" /> {t("supervisor.send_alert")}
          </button>
          <button
            onClick={() => handleSend("note")}
            className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-slate-900 dark:text-white rounded-lg flex items-center gap-1 transition"
          >
            <FileText className="w-4 h-4" /> {t("supervisor.send_note")}
          </button>
        </div>
      </div>
    </div>
  );
}
