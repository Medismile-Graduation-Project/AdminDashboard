"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useRtl } from "@/hooks/useRtl";
import RoleGuard from "@/components/RoleGuard";
import AnimatedWrapper from "@/components/AnimatedWrapper";
import Link from "next/link";
import { Users, GraduationCap, UserCheck } from "lucide-react";

/**
 * صفحة إدارة المستخدمين الرئيسية
 * متاحة فقط لمسؤول الجامعة
 */
export default function UsersPage() {
  return (
    <RoleGuard>
      <UsersContent />
    </RoleGuard>
  );
}

function UsersContent() {
  const { t } = useTranslation();
  const isRtl = useRtl();
  const router = useRouter();

  const tabs = [
    {
      id: "students",
      name: t("Users.students"),
      icon: GraduationCap,
      href: "/users/students",
      description: t("Users.manageStudents"),
    },
    {
      id: "supervisors",
      name: t("Users.supervisors"),
      icon: UserCheck,
      href: "/users/supervisors",
      description: t("Users.manageSupervisors"),
    },
  ];

  return (
    <AnimatedWrapper>
      <div className={`p-6 sm:p-8 space-y-8 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {t("Users.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {t("Users.description")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="block group"
              >
                <div className="p-6 bg-white dark:bg-dark-light rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-sky-50 dark:bg-sky-900/30 rounded-xl group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 transition-colors">
                      <TabIcon className="h-7 w-7 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                        {tab.name}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="p-5 sm:p-6 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
          <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
            {t("Users.quickActions")}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/users/students?action=create"
              className="px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-200 inline-flex items-center gap-2 font-semibold text-sm shadow-sm hover:shadow-md"
            >
              <GraduationCap size={18} />
              {t("Users.addStudent")}
            </Link>
            <Link
              href="/users/supervisors?action=create"
              className="px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-200 inline-flex items-center gap-2 font-semibold text-sm shadow-sm hover:shadow-md"
            >
              <UserCheck size={18} />
              {t("Users.addSupervisor")}
            </Link>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
}

