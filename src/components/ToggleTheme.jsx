"use client";

import { useSelector, useDispatch } from "react-redux";
import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "../redux/features/theme/themeSlice";
import { motion } from "framer-motion";

export default function ToggleTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  const handleToggle = () => {
    // تطبيق التغيير فوراً قبل تحديث Redux
    const newTheme = theme === "light" ? "dark" : "light";
    const html = document.documentElement;
    
    if (newTheme === "dark") {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
    
    // تحديث Redux
    dispatch(toggleTheme());
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: theme === "light" ? 15 : -15 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all ${
        theme === "dark"
          ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 dark:text-yellow-400"
          : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
      }`}
      title={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
      aria-label={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </motion.button>
  );
}
















