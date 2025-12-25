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
    <div className={`grid ${gridCols} gap-4`}>
      {cards.map((card) => {
        const Icon = card.icon;
        const label = isRtl ? card.label : card.labelEn || card.label;
        
        // تحديد لون Card حسب color property
        const colorClasses = {
          sky: "bg-sky-200 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700",
          blue: "bg-blue-200 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
          indigo: "bg-indigo-200 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700",
          amber: "bg-amber-200 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700",
          orange: "bg-orange-200 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
          purple: "bg-purple-200 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
          green: "bg-green-200 dark:bg-green-900/30 border-green-300 dark:border-green-700",
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
            className={`p-4 ${bgColor} rounded-lg shadow border-2 transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
              </p>
              {Icon && (
                <div className={iconColor}>
                  <Icon size={20} />
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {card.value !== undefined && card.value !== null ? card.value : 0}
            </p>
            {card.subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {card.subtitle}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}


