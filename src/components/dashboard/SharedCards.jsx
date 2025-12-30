"use client";

import { useTranslation } from "react-i18next";

/**
 * Component لعرض Dashboard Cards المشتركة
 * يمكن استخدامه من قبل جميع الأدوار
 */
export default function SharedCards({ cards = [] }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  if (!cards || cards.length === 0) return null;

  // تحديد عدد الأعمدة حسب عدد Cards
  const gridCols = cards.length === 1 ? "grid-cols-1" : 
                   cards.length === 2 ? "grid-cols-1 md:grid-cols-2" :
                   cards.length === 3 ? "grid-cols-1 md:grid-cols-3" :
                   "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-5`}>
      {cards.map((card) => {
        const Icon = card.icon;
        const label = isRtl ? card.label : card.labelEn || card.label;
        
        // تحديد لون Card حسب color property
        const colorClasses = {
          sky: "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800",
          blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          indigo: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
          amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
          orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
          purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
          green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        };

        const iconColorClasses = {
          sky: "text-sky-600 dark:text-sky-400",
          blue: "text-blue-600 dark:text-blue-400",
          indigo: "text-indigo-600 dark:text-indigo-400",
          amber: "text-amber-600 dark:text-amber-400",
          orange: "text-orange-600 dark:text-orange-400",
          purple: "text-purple-600 dark:text-purple-400",
          green: "text-green-600 dark:text-green-400",
        };

        const bgColor = colorClasses[card.color] || colorClasses.sky;
        const iconColor = iconColorClasses[card.color] || iconColorClasses.sky;

        return (
          <div
            key={card.id}
            className={`p-5 sm:p-6 ${bgColor} rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {label}
              </p>
              {Icon && (
                <div className={`${iconColor} p-2 rounded-lg bg-white/50 dark:bg-slate-800/50`}>
                  <Icon size={20} />
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {card.value !== undefined && card.value !== null ? card.value : 0}
            </p>
            {card.subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {card.subtitle}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}


