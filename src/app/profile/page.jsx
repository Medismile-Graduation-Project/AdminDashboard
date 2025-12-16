"use client";

import AnimatedWrapper from "@/components/AnimatedWrapper";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // توحيد المفتاح
    setCurrentUser(user);
  }, []);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-full mt-20">
        <p className="text-slate-600 dark:text-slate-400">
          الرجاء تسجيل الدخول للوصول إلى الملف الشخصي.
        </p>
      </div>
    );
  }

  const fallbackInitial = currentUser.name
    ? currentUser.name[0].toUpperCase()
    : currentUser.email[0].toUpperCase();

  return (
     <AnimatedWrapper>
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow p-4 sm:p-6 mt-4 sm:mt-6 border border-sky-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        {currentUser.image ? (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-slate-700 p-1 shadow">
            <img
              src={currentUser.image}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow">
            {fallbackInitial}
          </div>
        )}
        <div className="text-center sm:text-right">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-white">
            {currentUser.name || "مستخدم"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
        </div>
      </div>

      <div className="border-t border-sky-200 dark:border-slate-700 pt-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-blue-900 dark:text-white">معلومات الحساب</h2>
        <p className="text-slate-700 dark:text-slate-300 mb-2">
          <span className="font-semibold">البريد الإلكتروني:</span>{" "}
          {currentUser.email}
        </p>
        <p className="text-slate-700 dark:text-slate-300">
          <span className="font-semibold">الاسم:</span>{" "}
          {currentUser.name || "-"}
        </p>
      </div>
    </div>
    </AnimatedWrapper>
  );
}
