
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";

const UserIcon = dynamic(() =>
  import("@heroicons/react/24/outline").then((mod) => mod.UserIcon),
  { ssr: false }
);
const EnvelopeIcon = dynamic(() =>
  import("@heroicons/react/24/outline").then((mod) => mod.EnvelopeIcon),
  { ssr: false }
);
const LockClosedIcon = dynamic(() =>
  import("@heroicons/react/24/outline").then((mod) => mod.LockClosedIcon),
  { ssr: false }
);

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("supervisor"); // الدور الافتراضي
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => setLoading(false), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !role) {
      setError("يرجى ملء جميع الحقول");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // تحقق إذا كان الإيميل مستخدم من قبل
    const exists = users.find((u) => u.email === email);
    if (exists) {
      setError("هذا البريد مستخدم بالفعل");
      return;
    }

    // إنشاء مستخدم جديد مع الدور
    const newUser = {
      name: fullName,
      email,
      password,
      role, // الدور (مشرف / إدارة كلية)
      image: null,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(newUser));

    // إخطار باقي الواجهات
    window.dispatchEvent(new Event("user-login"));

    // التوجيه حسب الدور
    if (role === "supervisor") {
      router.push("/ClinicalCases");
    } else if (role === "college_admin") {
      router.push("/patients");
    } else {
      router.push("/");
    }
  };

  if (loading) return null;

  return (
    <div dir="rtl">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--color-text-light)] p-8 rounded-2xl shadow-xl border border-[var(--color-border)]">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-[var(--color-bg-dark)] mb-2">
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
            <h2 className="text-xl font-semibold text-[var(--color-bg-dark)]">
              أنشئ حسابك الجديد
            </h2>
            <p className="text-[var(--color-blue)] text-sm mt-2">
              الوصول إلى رعاية الأسنان التقنية والتعليم
            </p>
          </div>

          {error && (
            <p className="text-[var(--color-error)] text-sm mb-3 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <UserIcon className="h-5 w-5 absolute top-3 right-3 text-[var(--color-blue)]" />
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pr-10 px-4 py-2 border border-[var(--color-border)] rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] 
                           bg-[var(--color-bg-lightest)] text-[var(--color-bg-dark)] transition"
              />
            </div>

            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 absolute top-3 right-3 text-[var(--color-blue)]" />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 px-4 py-2 border border-[var(--color-border)] rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] 
                           bg-[var(--color-bg-lightest)] text-[var(--color-bg-dark)] transition"
              />
            </div>

            <div className="relative">
              <LockClosedIcon className="h-5 w-5 absolute top-3 right-3 text-[var(--color-blue)]" />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 px-4 py-2 border border-[var(--color-border)] rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] 
                           bg-[var(--color-bg-lightest)] text-[var(--color-bg-dark)] transition"
              />
            </div>

            {/* اختيار الدور */}
            <div>
              <label className="block text-sm mb-1 text-[var(--color-bg-dark)]">اختر الدور</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg 
                           bg-[var(--color-bg-lightest)] text-[var(--color-bg-dark)] focus:outline-none 
                           focus:ring-2 focus:ring-[var(--color-accent)] transition"
              >
                <option value="supervisor">مشرف</option>
                <option value="college_admin">إدارة الكلية</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-blue)] hover:bg-[var(--color-accent)] 
                         text-[var(--color-text-light)] font-semibold py-2 rounded-lg transition-all duration-200"
            >
              إنشاء حساب جديد
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full border border-[var(--color-blue)] text-[var(--color-blue)] 
                         hover:bg-[var(--color-blue-light)] font-semibold py-2 rounded-lg transition-all duration-200"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

