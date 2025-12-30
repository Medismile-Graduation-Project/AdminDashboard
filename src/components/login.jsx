
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import Image from "next/image";
import { loginAsync, logoutAsync } from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";

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
  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // إذا كان المستخدم مسجلاً دخوله بالفعل، نعيد توجيهه بعيداً عن صفحة تسجيل الدخول
    if (hasChecked) return; // منع إعادة التحقق
    
    try {
      const storedUser =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user") || "null")
          : null;
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (storedUser && accessToken) {
        // هذا المشروع خاص فقط بإدارة الجامعة
        // جميع المستخدمين يوجهون للصفحة الرئيسية
        setHasChecked(true);
        router.push("/");
      } else {
        setHasChecked(true);
        setIsLoading(false);
      }
    } catch {
      setHasChecked(true);
      setIsLoading(false);
    }
  }, [hasChecked, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      const result = await dispatch(loginAsync({ email, password })).unwrap();
      
      if (result?.user) {
        toast.success("تم تسجيل الدخول بنجاح");
        
        // التوجيه حسب الدور
        // ملاحظة: هذا المشروع خاص فقط بمسؤول الجامعة (university_admin)
        const role = result.user.role;
        
        if (role === "university_admin" || role === "college_admin") {
          // مسؤول الجامعة → الصفحة الرئيسية (Dashboard)
          router.push("/");
        } else {
          // إذا كان المستخدم ليس مسؤول جامعة، نوجهه للـ login مرة أخرى
          // (لأن هذا المشروع خاص فقط بمسؤول الجامعة)
          toast.error("هذا الحساب غير مصرح له بالوصول");
          dispatch(logoutAsync());
          router.push("/login");
        }
      }
    } catch (err) {
      const errorMessage = err || "البريد أو كلمة المرور غير صحيحة";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (isLoading) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-sky-50 dark:bg-slate-900">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-dark-light p-8 sm:p-10 rounded-2xl shadow-xl border border-sky-200 dark:border-slate-700">
          {/* Logo and Header Section */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-white dark:bg-slate-800 p-1.5 flex items-center justify-center shadow-md border border-sky-100 dark:border-slate-700">
                <Image
                  src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
                  alt="MediSmile Logo"
                  width={72}
                  height={72}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              أهلاً بك
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              الوصول إلى رعاية الأسنان التقنية والتعليم
            </p>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
                {error || authError}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                البريد الإلكتروني
              </label>
              <EnvelopeIcon className="h-5 w-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-sky-500 dark:text-sky-400 pointer-events-none" />
              <input
                id="email"
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-11 pl-4 py-3 border border-sky-200 dark:border-slate-600 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                           bg-sky-50 dark:bg-slate-800 text-slate-900 dark:text-white 
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           transition-all duration-200"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <LockClosedIcon className="h-5 w-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-sky-500 dark:text-sky-400 pointer-events-none" />
              <input
                id="password"
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-11 pl-4 py-3 border border-sky-200 dark:border-slate-600 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                           bg-sky-50 dark:bg-slate-800 text-slate-900 dark:text-white 
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600
                         disabled:bg-sky-300 dark:disabled:bg-sky-800 disabled:cursor-not-allowed
                         text-white font-semibold py-3 px-4 rounded-lg 
                         transition-all duration-200 shadow-sm hover:shadow-md
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

