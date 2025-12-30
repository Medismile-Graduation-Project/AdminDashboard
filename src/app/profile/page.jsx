"use client";

import AnimatedWrapper from "@/components/AnimatedWrapper";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchUniversityAdminProfile } from "@/services/universityApi";
import { useRole } from "@/hooks/useRole";
import { useRtl } from "@/hooks/useRtl";
import { Loader2, Mail, Phone, MapPin, Calendar, User, Building2, Briefcase, Users } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useRole();
  const isRtl = useRtl();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // إذا كان المستخدم مسؤول جامعة، نجلب الملف الشخصي من API
        if (user?.role === "university_admin" || user?.role === "college_admin") {
          const profileData = await fetchUniversityAdminProfile();
          setProfile(profileData);
        } else {
          // للمستخدمين الآخرين، نستخدم البيانات من localStorage
          const localUser = JSON.parse(localStorage.getItem("user") || "null");
          setProfile(localUser);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error(t("Profile.loadError"));
        // Fallback إلى بيانات localStorage
        const localUser = JSON.parse(localStorage.getItem("user") || "null");
        setProfile(localUser);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <AnimatedWrapper>
        <div className="flex justify-center items-center h-full mt-20">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      </AnimatedWrapper>
    );
  }

  if (!profile) {
    return (
      <AnimatedWrapper>
        <div className="flex justify-center items-center h-full mt-20">
          <p className="text-slate-600 dark:text-slate-400">
            {t("Profile.pleaseLogin")}
          </p>
        </div>
      </AnimatedWrapper>
    );
  }

  // استخراج الاسم الكامل
  const fullName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.name || profile.username || profile.email?.split("@")[0] || t("Profile.user");

  const fallbackInitial = fullName[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U";

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // تنسيق الجنس
  const formatGender = (gender) => {
    if (!gender) return "-";
    const genderMap = {
      male: t("Profile.male"),
      female: t("Profile.female"),
    };
    return genderMap[gender] || gender;
  };

  return (
    <AnimatedWrapper>
      <div className={`max-w-4xl mx-auto p-6 sm:p-8 ${isRtl ? "text-right" : "text-left"}`}>
        {/* بطاقة الملف الشخصي الرئيسية */}
        <div className="bg-white dark:bg-dark-light rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header مع الصورة */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 p-6 sm:p-8">
            <div className={`flex flex-col sm:flex-row items-center gap-6 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
              {profile.profile_picture ? (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-slate-700 p-1 shadow-lg border-2 border-white/50">
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-lg border-2 border-white/30">
                  {fallbackInitial}
                </div>
              )}
              <div className={`text-center sm:text-right flex-1 ${isRtl ? "sm:text-right" : "sm:text-left"}`}>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {fullName}
                </h1>
                <p className={`text-sky-100 text-sm sm:text-base flex items-center gap-2 ${isRtl ? "justify-center sm:justify-end flex-row-reverse" : "justify-center sm:justify-start"}`}>
                  <Mail size={18} className="flex-shrink-0" />
                  {profile.email}
                </p>
                {profile.role && (
                  <span className="inline-block mt-3 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm rounded-full font-semibold">
                    {profile.role === "university_admin" ? t("Profile.universityAdmin") : profile.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* معلومات الملف الشخصي */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* معلومات الاتصال */}
            <div>
              <h2 className={`text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <User size={20} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />
                {t("Profile.contactInfo")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.phone_number && (
                  <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <Phone size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.phoneNumber")}</p>
                      <p className="text-slate-900 dark:text-white font-semibold">{profile.phone_number}</p>
                    </div>
                  </div>
                )}
                {profile.address && (
                  <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <MapPin size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.address")}</p>
                      <p className="text-slate-900 dark:text-white font-semibold whitespace-pre-line leading-relaxed">{profile.address}</p>
                    </div>
                  </div>
                )}
                {profile.date_of_birth && (
                  <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <Calendar size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.dateOfBirth")}</p>
                      <p className="text-slate-900 dark:text-white font-semibold">{formatDate(profile.date_of_birth)}</p>
                    </div>
                  </div>
                )}
                {profile.gender && (
                  <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <Users size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.gender")}</p>
                      <p className="text-slate-900 dark:text-white font-semibold">{formatGender(profile.gender)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* معلومات العمل */}
            {(profile.university_name || profile.department || profile.position) && (
              <div>
                <h2 className={`text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Briefcase size={20} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />
                  {t("Profile.workInfo")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.university_name && (
                    <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <Building2 size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.university")}</p>
                        <p className="text-slate-900 dark:text-white font-semibold">{profile.university_name}</p>
                      </div>
                    </div>
                  )}
                  {profile.department && (
                    <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <Briefcase size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.department")}</p>
                        <p className="text-slate-900 dark:text-white font-semibold">{profile.department}</p>
                      </div>
                    </div>
                  )}
                  {profile.position && (
                    <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <User size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.position")}</p>
                        <p className="text-slate-900 dark:text-white font-semibold">{profile.position}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* معلومات الحساب */}
            <div>
              <h2 className={`text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <Mail size={20} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />
                {t("Profile.accountInfo")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Mail size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.email")}</p>
                    <p className="text-slate-900 dark:text-white font-semibold">{profile.email}</p>
                  </div>
                </div>
                {profile.user_id && (
                  <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <User size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.userId")}</p>
                      <p className="text-slate-900 dark:text-white font-semibold text-xs font-mono">{profile.user_id}</p>
                    </div>
                  </div>
                )}
                {profile.created_at && (
                  <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <Calendar size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.createdAt")}</p>
                      <p className="text-slate-900 dark:text-white font-semibold">{formatDate(profile.created_at)}</p>
                    </div>
                  </div>
                )}
                {profile.updated_at && (
                  <div className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <Calendar size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t("Profile.updatedAt")}</p>
                      <p className="text-slate-900 dark:text-white font-semibold">{formatDate(profile.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
}
