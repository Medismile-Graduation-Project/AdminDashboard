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
      name: "الطلاب",
      nameEn: "Students",
      icon: GraduationCap,
      href: "/users/students",
    },
    {
      id: "supervisors",
      name: "المشرفين",
      nameEn: "Supervisors",
      icon: UserCheck,
      href: "/users/supervisors",
    },
  ];

  return (
    <AnimatedWrapper>
      <div className={`p-6 space-y-6 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            إدارة المستخدمين
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            إدارة الطلاب والمشرفين في الجامعة
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const tabName = isRtl ? tab.name : tab.nameEn;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="block"
              >
                <div className="p-6 bg-white dark:bg-dark-light rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                      <TabIcon className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                        {tabName}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        إدارة {tab.name.toLowerCase()} في الجامعة
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-sky-100 dark:bg-sky-900/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            إجراءات سريعة
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/users/students?action=create"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors inline-flex items-center gap-2"
            >
              <GraduationCap size={18} />
              إضافة طالب جديد
            </Link>
            <Link
              href="/users/supervisors?action=create"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors inline-flex items-center gap-2"
            >
              <UserCheck size={18} />
              إضافة مشرف جديد
            </Link>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
}

