"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useRtl } from "@/hooks/useRtl";
import Link from "next/link";
import { ShieldX, Home, ArrowLeft } from "lucide-react";
import AnimatedWrapper from "@/components/AnimatedWrapper";

/**
 * صفحة Unauthorized
 * تظهر عندما يحاول المستخدم الوصول إلى صفحة أو مورد ليس لديه صلاحية للوصول إليه
 */
export default function UnauthorizedPage() {
  const { t } = useTranslation();
  const isRtl = useRtl();
  const router = useRouter();

  useEffect(() => {
    // بعد 5 ثوانٍ، نعيد المستخدم للصفحة الرئيسية تلقائياً
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatedWrapper>
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
              <ShieldX className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            غير مصرح بالوصول
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة أو المورد.
            <br />
            إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالدعم الفني.
          </p>

          {/* Auto redirect message */}
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">
            سيتم إعادة توجيهك إلى الصفحة الرئيسية خلال 5 ثوانٍ...
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
            >
              <Home size={20} />
              الصفحة الرئيسية
            </Link>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              العودة للخلف
            </button>
          </div>

          {/* Support link */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/support"
              className="text-sky-600 dark:text-sky-400 hover:underline text-sm"
            >
              اتصل بالدعم الفني
            </Link>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
}


