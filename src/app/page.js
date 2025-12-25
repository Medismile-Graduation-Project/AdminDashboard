"use client";

import { useTranslation } from "react-i18next";
import { useRtl } from "../hooks/useRtl";
import { useRole } from "@/hooks/useRole";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import UniversityAdminDashboard from "@/components/dashboard/UniversityAdminDashboard";
import RoleGuard from "@/components/RoleGuard";

/**
 * الصفحة الرئيسية - Dashboard
 * 
 * ملاحظة: هذا المشروع خاص فقط بإدارة الجامعة (university_admin)
 */
export default function Home() {
  const { t } = useTranslation();
  const isRtl = useRtl();
  const { user } = useRole();

  const userName = user?.first_name || user?.username || t("Home.guest");

  return (
    <RoleGuard>
      <AnimatedWrapper>
        <div className={`p-6 space-y-8 ${isRtl ? "text-right" : "text-left"}`}>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            {t("Home.greeting", { name: userName }) || `مرحباً ${userName}`}
          </h1>

          {/* Dashboard خاص بإدارة الجامعة فقط */}
          <UniversityAdminDashboard />
        </div>
      </AnimatedWrapper>
    </RoleGuard>
  );
}
