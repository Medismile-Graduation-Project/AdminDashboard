"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useRtl } from "../hooks/useRtl";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AnimatedWrapper from "@/components/AnimatedWrapper";



const BellIcon = dynamic(() =>
  import("@heroicons/react/24/outline").then((mod) => mod.BellIcon),
  { ssr: false }
);
const CalendarIcon = dynamic(() =>
  import("@heroicons/react/24/outline").then((mod) => mod.CalendarIcon),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const isRtl = useRtl();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ⚠️ معلق مؤقتاً للاختبار - يمكن الوصول بدون login
    // const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    // if (!currentUser) {
    //   router.push("/login");
    // } else {
    //   setUser(currentUser);
    // }
    
    // إنشاء user افتراضي للاختبار
    const mockUser = { id: 1, name: "Test User", role: "supervisor" };
    setUser(mockUser);
  }, [router]);

  if (!user) return null;

  // بيانات وهمية للإحصائيات
  const weeklyConsults = [
    { day: t("Days.Sunday"), consults: 5 },
    { day: t("Days.Monday"), consults: 8 },
    { day: t("Days.Tuesday"), consults: 6 },
    { day: t("Days.Wednesday"), consults: 9 },
    { day: t("Days.Thursday"), consults: 4 },
    { day: t("Days.Friday"), consults: 7 },
    { day: t("Days.Saturday"), consults: 3 },
  ];

  const studentPerformance = [
    { name: "أحمد", score: 80, completedTasks: 5 },
    { name: "ليلى", score: 92, completedTasks: 8 },
    { name: "سعيد", score: 75, completedTasks: 6 },
    { name: "نور", score: 88, completedTasks: 7 },
  ];

  const systemUsagePie = [
    { name: t("Home.charts.systemUsageData.logins"), value: 80 },
    { name: t("Home.charts.systemUsageData.consults"), value: 45 },
    { name: t("Home.charts.systemUsageData.completedTasks"), value: 30 },
  ];

  const COLORS = ["#0ea5e9", "#bae6fd", "#0369a1"]; // brand-500, brand-200, brand-700

  const notifications = [
    { message: t("Home.notificationsList.new") + " من الطالب أحمد", time: "قبل 10 دقائق" },
    { message: "تمت الموافقة على حالة جديدة", time: "قبل ساعة" },
  ];

  const upcomingAppointments = [
    { title: t("Home.appointmentsList.appointment1"), time: "اليوم الساعة 15:00" },
    { title: t("Home.appointmentsList.appointment2"), time: "غداً الساعة 10:00" },
  ];

  return (
    <AnimatedWrapper>
    <div className={`p-6 space-y-8 ${isRtl ? "text-right" : "text-left"}`}>
      <h1 className="text-3xl font-bold text-dark dark:text-white">{t("Home.greeting", { name: user.name })}</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t("Home.cards.totalPatients"), value: 120 },
          { label: t("Home.cards.activeStudents"), value: 45 },
          { label: t("Home.cards.ongoingCases"), value: 32 },
          { label: t("Home.cards.averageSatisfaction"), value: "88%" },
        ].map((card, idx) => (
          <div key={idx} className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow">
            <p className="text-sm text-sky-700 dark:text-sky-300">{card.label}</p>
            <p className="text-2xl font-bold text-dark dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={`flex flex-col lg:flex-row gap-4 ${isRtl ? "lg:flex-row-reverse" : ""}`}>
        {/* Student Performance */}
        <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow flex-1 min-w-[300px]">
          <h2 className="text-lg font-semibold mb-2 text-dark dark:text-white">
            {t("Home.charts.studentPerformance")}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#0ea5e9" />
              <Bar dataKey="completedTasks" fill="#bae6fd" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Consults */}
        <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow flex-1 min-w-[300px]">
          <h2 className="text-lg font-semibold mb-2 text-dark dark:text-white">
            {t("Home.charts.weeklyConsults")}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyConsults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="consults"
                stroke="#0ea5e9"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Usage */}
        <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow flex-1 min-w-[300px]">
          <h2 className="text-lg font-semibold mb-2 text-dark dark:text-white">
            {t("Home.charts.systemUsage")}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={systemUsagePie}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {systemUsagePie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Notifications & Appointments & Quick Access */}
      <div className={`flex flex-col lg:flex-row gap-4 ${isRtl ? "lg:flex-row-reverse" : ""}`}>
        <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow flex-1 min-w-[250px]">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-dark dark:text-white">
            <BellIcon className="h-5 w-5" /> {t("Home.notifications")}
          </h2>
          <ul
            className={`list-disc space-y-1 ${
              isRtl ? "pr-5 text-right" : "pl-5 text-left"
            }`}
          >
            {notifications.map((note, idx) => (
              <li key={idx} className="text-sky-700 dark:text-sky-300">
                {note.message} -{" "}
                <span className="text-sm text-sky-500">{note.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow flex-1 min-w-[250px]">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-dark dark:text-white">
            <CalendarIcon className="h-5 w-5" /> {t("Home.upcomingAppointments")}
          </h2>
          <ul
            className={`list-disc space-y-1 ${
              isRtl ? "pr-5 text-right" : "pl-5 text-left"
            }`}
          >
            {upcomingAppointments.map((app, idx) => (
              <li key={idx} className="text-sky-700 dark:text-sky-300">
                {app.title} -{" "}
                <span className="text-sm text-sky-500">{app.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-sky-200 dark:bg-dark-light rounded-lg shadow flex-1 min-w-[250px]">
          <h2 className="text-lg font-semibold mb-2 text-dark dark:text-white">
            {t("Home.quickAccess")}
          </h2>
          <ul
            className={`list-disc space-y-1 ${
              isRtl ? "pr-5 text-right" : "pl-5 text-left"
            }`}
          >
            <li className="text-sky-700 dark:text-sky-300">{t("Home.notificationsList.new")}</li>
            <li className="text-sky-700 dark:text-sky-300">{t("Home.notificationsList.old")}</li>
          </ul>
        </div>
      </div>
    </div>
    </AnimatedWrapper>
  );
}
