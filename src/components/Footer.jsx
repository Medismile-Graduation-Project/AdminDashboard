"use client";

import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  BarChart2, 
  BookOpen, 
  Star,
  File,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const isRtl = i18n.language === "ar";
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  // Hide footer on login/register pages
  const hideFooter = ["/login", "/register"].some((p) =>
    pathname.startsWith(p)
  );

  if (hideFooter) return null;

  // Navigation links based on user role
  const getNavigationLinks = () => {
    const links = [
      { name: t("Sidebar.home"), href: "/", icon: <Home size={16} /> }
    ];

    if (user?.role === "supervisor") {
      links.push(
        { name: t("Sidebar.clinicalCases"), href: "/ClinicalCases" },
        { name: t("Sidebar.sessions"), href: "/sessions" },
        { name: t("Sidebar.appointments"), href: "/appointments" },
        { name: t("Sidebar.instructions"), href: "/supervisor" },
        { name: t("Sidebar.evaluations"), href: "/evaluations" },
        { name: t("Sidebar.studentsmanag"), href: "/studentsmanag" }
      );
    }

    if (user?.role === "college_admin") {
      links.push(
        { name: t("Sidebar.patients"), href: "/patients" },
        { name: t("Sidebar.appointments"), href: "/appointments" },
        { name: t("Sidebar.treatments"), href: "/treatments" },
        { name: t("Sidebar.reports"), href: "/reports" },
        { name: t("Sidebar.content"), href: "/Medicontent" },
        { name: t("Sidebar.studentsmanag"), href: "/studentsmanag" }
      );
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  // Social media links - يمكنك تعديل الروابط حسب احتياجك
  const socialLinks = [
    {
      name: "WhatsApp",
      icon: <MessageCircle size={20} />,
      href: "https://wa.me/1234567890", // استبدل برقم الواتساب
      color: "hover:text-green-500 dark:hover:text-green-400"
    },
    {
      name: "Facebook",
      icon: <Facebook size={20} />,
      href: "https://facebook.com/medismile", // استبدل برابط الفيس بوك
      color: "hover:text-blue-600 dark:hover:text-blue-400"
    },
    {
      name: "Instagram",
      icon: <Instagram size={20} />,
      href: "https://instagram.com/medismile", // استبدل برابط الإنستغرام
      color: "hover:text-pink-500 dark:hover:text-pink-400"
    },
    {
      name: "Twitter",
      icon: <Twitter size={20} />,
      href: "https://twitter.com/medismile", // استبدل برابط التويتر
      color: "hover:text-blue-400 dark:hover:text-blue-300"
    },
    {
      name: "YouTube",
      icon: <Youtube size={20} />,
      href: "https://youtube.com/@medismile", // استبدل برابط اليوتيوب
      color: "hover:text-red-600 dark:hover:text-red-400"
    }
  ];

  return (
    <motion.footer
      dir={isRtl ? "rtl" : "ltr"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-auto w-full bg-gradient-to-b from-sky-50 via-sky-200 to-blue-900 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-t border-sky-300 dark:border-slate-700 transition-colors duration-200 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Logo and Description */}
          <div className={`flex flex-col gap-4 ${isRtl ? "text-right" : "text-left"}`}>
            <div className="flex items-center gap-3">
              <Image
                src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
                alt={t("Navbar.logoAlt")}
                width={50}
                height={50}
                className="rounded-full border border-sky-300 dark:border-slate-600 shadow-md dark:shadow-slate-900 bg-white dark:bg-slate-800"
              />
              <span className="font-extrabold text-xl text-blue-900 dark:text-slate-50">
                {t("Root.title")}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {t("Footer.description")}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail size={16} className="text-slate-500 dark:text-slate-400" />
              <a 
                href={`mailto:${t("Footer.email")}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t("Footer.email")}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone size={16} className="text-slate-500 dark:text-slate-400" />
              <a 
                href={`tel:${t("Footer.phone")}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t("Footer.phone")}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`flex flex-col gap-4 ${isRtl ? "text-right" : "text-left"}`}>
            <h3 className="font-bold text-lg text-blue-900 dark:text-slate-100">
              {t("Footer.quickLinks")}
            </h3>
            <ul className="flex flex-col gap-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className={`flex flex-col gap-4 ${isRtl ? "text-right" : "text-left"}`}>
            <h3 className="font-bold text-lg text-blue-900 dark:text-slate-100">
              {t("Footer.contactSupport")}
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`https://wa.me/${t("Footer.whatsappNumber")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors group"
                >
                  <MessageCircle size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                  <span>{t("Footer.whatsapp")}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t("Footer.supportEmail")}`}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <Mail size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span>{t("Footer.supportEmail")}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t("Footer.supportPhone")}`}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <Phone size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span>{t("Footer.supportPhone")}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className={`flex flex-col gap-4 ${isRtl ? "text-right" : "text-left"}`}>
            <h3 className="font-bold text-lg text-blue-900 dark:text-slate-100">
              {t("Footer.followUs")}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {t("Footer.socialDescription")}
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-sky-200 dark:border-slate-600 shadow-sm dark:shadow-slate-900 transition-all duration-200 ${social.color} hover:scale-110 hover:shadow-md dark:hover:shadow-slate-800 hover:border-opacity-50`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={`mt-8 pt-6 border-t border-sky-300 dark:border-slate-600 ${isRtl ? "text-right" : "text-left"}`}>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("Footer.copyright")} © {new Date().getFullYear()} {t("Root.title")}. {t("Footer.rightsReserved")}
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

