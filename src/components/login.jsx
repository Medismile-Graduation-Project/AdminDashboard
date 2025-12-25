
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

          {(error || authError) && (
            <p className="text-red-600 text-sm mb-3 text-center">
              {error || authError}
            </p>
          )}

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
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed
                         text-white font-semibold py-2 rounded-lg transition-all duration-200"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

