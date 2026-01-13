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
          <div className="mb-6 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-sky-100 dark:border-slate-700">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-600 bg-clip-text text-transparent mb-2">
              {t("Home.greeting", { name: userName }) || `مرحباً ${userName}`}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
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
