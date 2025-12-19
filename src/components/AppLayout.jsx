"use client";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme, updateThemeFromSystem } from "../redux/features/theme/themeSlice";
import { setUser } from "../redux/features/auth/authSlice";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnimatedWrapper from "./AnimatedWrapper";
import PageLoader from "./PageLoader";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  // التحقق من المصادقة عند التحميل
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const accessToken = localStorage.getItem("access_token");
      
      if (user && accessToken) {
        // تحديث Redux state بالمستخدم
        dispatch(setUser(user));
      } else if (!hideLayout) {
        // إذا لم يكن هناك user أو token وكان في صفحة محمية، نوجه للـ login
        router.push("/login");
      }
    }
  }, [dispatch, router, pathname]);

  const hideLayout = ["/login", "/register"].some((p) =>
    pathname.startsWith(p)
  );

  // عند تغيير المسار: أظهر اللودينغ فورًا ثم أخفِه بعد 0.3 ثانية
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  // توجيه الروابط: اضغط رابط → يظهر اللودينغ فورًا
  useEffect(() => {
    const handleLinkClick = (e) => {
      const link = e.target.closest("a");
      if (link && link.href && !link.target?.includes("_blank")) {
        setLoading(true);
      }
    };
    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
      document.documentElement.lang = i18n.language;
    }
  }, [isRtl, i18n.language]);

  // تحميل Theme من localStorage أو من النظام عند التحميل
  useEffect(() => {
    if (typeof window !== "undefined") {
      // تحقق من localStorage أولاً
      const savedTheme = localStorage.getItem("theme");
      
      const html = document.documentElement;
      
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        // إذا كان هناك theme محفوظ وصحيح، استخدمه
        dispatch(setTheme(savedTheme));
        // تطبيق الـ theme فوراً
        if (savedTheme === "dark") {
          html.classList.add("dark");
          html.style.colorScheme = "dark";
        } else {
          html.classList.remove("dark");
          html.style.colorScheme = "light";
        }
      } else {
        // إذا لم يكن هناك theme محفوظ، استخدم prefer-color-scheme من النظام
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const systemTheme = prefersDark ? "dark" : "light";
        // تحديث state بدون حفظ في localStorage
        dispatch(updateThemeFromSystem(systemTheme));
        // تطبيق الـ theme فوراً
        if (systemTheme === "dark") {
          html.classList.add("dark");
          html.style.colorScheme = "dark";
        } else {
          html.classList.remove("dark");
          html.style.colorScheme = "light";
        }
      }
      
      // الاستماع لتغييرات النظام (prefers-color-scheme)
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = (e) => {
        // فقط إذا لم يكن هناك theme محفوظ في localStorage
        if (!localStorage.getItem("theme")) {
          const newTheme = e.matches ? "dark" : "light";
          const html = document.documentElement;
          // تحديث state بدون حفظ في localStorage
          dispatch(updateThemeFromSystem(newTheme));
          // تطبيق الـ theme فوراً
          if (newTheme === "dark") {
            html.classList.add("dark");
            html.style.colorScheme = "dark";
          } else {
            html.classList.remove("dark");
            html.style.colorScheme = "light";
          }
        }
      };
      
      // إضافة listener لتغييرات النظام
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleSystemThemeChange);
      } else {
        // Fallback للمتصفحات القديمة
        mediaQuery.addListener(handleSystemThemeChange);
      }
      
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleSystemThemeChange);
        } else {
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      };
    }
  }, [dispatch]);

  // تطبيق Theme على document و body - فوري ومباشر
  useEffect(() => {
    if (typeof window !== "undefined") {
      const html = document.documentElement;
      html.setAttribute("data-theme", theme);
      
      // إضافة/إزالة class dark فوراً
      if (theme === "dark") {
        html.classList.add("dark");
        html.style.colorScheme = "dark";
      } else {
        html.classList.remove("dark");
        html.style.colorScheme = "light";
      }
    }
  }, [theme]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-dark">
      <PageLoader loading={loading} hasSidebar={!hideLayout} />

      {!hideLayout && <Sidebar />}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200
          ${hideLayout ? "w-full" : ""}
          ${
            !hideLayout
              ? "lg:ms-64 ms-0"
              : ""
          }`}
      >
        <main
          className={`flex-1 px-4 md:px-6 pb-4 md:pb-6
            ${!hideLayout ? "pt-14 lg:pt-16" : "pt-0"}`}
        >
          {!hideLayout && <Navbar />}
          <AnimatedWrapper>{children}</AnimatedWrapper>
        </main>
        {!hideLayout && <Footer />}
      </div>
    </div>
  );
}
