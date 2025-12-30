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
        <div className={`p-6 sm:p-8 space-y-8 ${isRtl ? "text-right" : "text-left"}`}>
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {t("Home.greeting", { name: userName }) || `مرحباً ${userName}`}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              {t("Home.description")}
            </p>
          </div>

          {/* Dashboard خاص بإدارة الجامعة فقط */}
          <UniversityAdminDashboard />
        </div>
      </AnimatedWrapper>
    </RoleGuard>
  );
}
