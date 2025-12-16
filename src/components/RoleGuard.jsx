"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function RoleGuard({ children, allowedRoles = [] }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = getUser();
    if (!stored) {
      router.push("/login");
      return;
    }
    if (!allowedRoles.includes(stored.role)) {
      router.push("/unauthorized");
      return;
    }
    setUser(stored);
  }, []);

  // لمنع الوميض قبل التحقق
  if (!user) return null;

  return <>{children}</>;
}
