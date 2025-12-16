
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";

const EnvelopeIcon = dynamic(() =>
  import("@heroicons/react/24/outline").then((mod) => mod.EnvelopeIcon),
  { ssr: false }
);
const LockClosedIcon = dynamic(() =>
  import("@heroicons/react/24/outline").then((mod) => mod.LockClosedIcon),
  { ssr: false }
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    if (currentUser) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("البريد أو كلمة المرور غير صحيحة");
      return;
    }

    // حفظ المستخدم في localStorage بنفس المفتاح المستخدم بالSidebar
    localStorage.setItem("user", JSON.stringify(user));

    window.dispatchEvent(new Event("user-login"));

    // التوجيه حسب الدور
    if (user.role === "supervisor") {
      router.push("/ClinicalCases");
    } else if (user.role === "college_admin") {
      router.push("/patients");
    } else {
      router.push("/"); // افتراضي
    }
  };

  if (loading) return null;

  return (
    <div dir="rtl">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-sky-200">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold mb-2">
              <div className="mx-auto w-18 h-18 rounded-full bg-white p-1 flex items-center justify-center">
                <Image
                  src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
                  alt="MediSmile Logo"
                  width={72}
                  height={72}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-blue-900">أهلاً بك</h2>
            <p className="text-blue-500 text-sm mt-2">
              الوصول إلى رعاية الأسنان التقنية والتعليم
            </p>
          </div>

          {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 absolute top-3 right-3 text-blue-500" />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 px-4 py-2 border border-sky-200 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-600 
                           bg-sky-50 text-slate-900 transition"
              />
            </div>

            <div className="relative">
              <LockClosedIcon className="h-5 w-5 absolute top-3 right-3 text-blue-500" />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 px-4 py-2 border border-sky-200 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-600 
                           bg-sky-50 text-slate-900 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 
                         text-white font-semibold py-2 rounded-lg transition-all duration-200"
            >
              تسجيل الدخول
            </button>

            <button
              type="button"
              onClick={() => router.push("/register")}
              className="w-full border border-blue-500 text-blue-500 
                         hover:bg-sky-200 font-semibold py-2 rounded-lg transition-all duration-200"
            >
              إنشاء حساب جديد
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

