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
        { name: t("Sidebar.studentsmanag"), href: "/studentsmanag" },
        { name: "المواد الدراسية", href: "/subjects" }
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
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="mt-auto w-full bg-white dark:bg-dark-light border-t border-slate-200 dark:border-dark-lighter"
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Logo and Description */}
          <div className="flex flex-col gap-4 text-start">
            <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <Image
                src="/Screenshot_٢٠٢٥٠٩٠٨-١٢٣٢٥٥.jpg"
                alt={t("Navbar.logoAlt")}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-semibold text-lg text-slate-900 dark:text-white">
                {t("Root.title")}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("Footer.description")}
            </p>
            <div className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <Mail size={16} />
              <a 
                href={`mailto:${t("Footer.email")}`}
                className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                {t("Footer.email")}
              </a>
            </div>
            <div className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <Phone size={16} />
              <a 
                href={`tel:${t("Footer.phone")}`}
                className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                {t("Footer.phone")}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4 text-start">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              {t("Footer.quickLinks")}
            </h3>
            <ul className="flex flex-col gap-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="flex flex-col gap-4 text-start">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              {t("Footer.contactSupport")}
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={`https://wa.me/${t("Footer.whatsappNumber")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                >
                  <MessageCircle size={16} />
                  <span>{t("Footer.whatsapp")}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t("Footer.supportEmail")}`}
                  className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Mail size={16} />
                  <span>{t("Footer.supportEmail")}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t("Footer.supportPhone")}`}
                  className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Phone size={16} />
                  <span>{t("Footer.supportPhone")}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="flex flex-col gap-4 text-start">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              {t("Footer.followUs")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("Footer.socialDescription")}
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg bg-white dark:bg-dark-light border border-slate-200 dark:border-dark-lighter text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-dark-lighter ${social.color}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-dark-lighter text-start">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("Footer.copyright")} © {new Date().getFullYear()} {t("Root.title")}. {t("Footer.rightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}

