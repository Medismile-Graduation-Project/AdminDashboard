 "use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getAccessToken, hasAllowedRole } from "@/lib/auth";

export default function RoleGuard({ children, allowedRoles = [] }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = getUser();
    const token = getAccessToken();

    // غير مسجل دخول → توجيه لصفحة تسجيل الدخول
    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    // مسجل دخول لكن ليس ضمن الأدوار المسموح بها
    if (!hasAllowedRole(storedUser, allowedRoles)) {
      // لا توجد صفحة unauthorized حالياً، نعيده للصفحة الرئيسية
      router.push("/");
      return;
    }

    setReady(true);
  }, [allowedRoles, router]);

  if (!ready) return null;

  return <>{children}</>;
}
