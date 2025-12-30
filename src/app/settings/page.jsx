"use client";

import AnimatedWrapper from "@/components/AnimatedWrapper";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // توحيد المفتاح
    if (user) {
      setCurrentUser(user);
      setFullName(user.name || "");
      setEmail(user.email || "");
      setProfileImage(user.image || null);
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword && currentPassword !== currentUser.password) {
      setMessage(t("Settings.wrongPassword"));
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: fullName,
      email,
      password: newPassword ? newPassword : currentUser.password,
      image: profileImage,
    };

    // تحديث users
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.map((u) => (u.email === currentUser.email ? updatedUser : u));

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(updatedUser)); // توحيد المفتاح
    setCurrentUser(updatedUser);

    window.dispatchEvent(new Event("user-login"));

    setMessage(t("Settings.savedSuccessfully"));
  };

  if (!currentUser)
    return (
      <div className="flex justify-center items-center h-full mt-20">
        <p className="text-slate-600 dark:text-slate-400">
          {t("Settings.pleaseLogin")}
        </p>
      </div>
    );

  return (
    <AnimatedWrapper>
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow p-4 sm:p-6 mt-4 sm:mt-6 border border-sky-200 dark:border-slate-700">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-900 dark:text-white">{t("Settings.title")}</h2>

      {message && (
        <p className="text-green-600 font-semibold mb-4">{message}</p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center gap-4">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white">
              {fullName ? fullName[0].toUpperCase() : email[0].toUpperCase()}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("Settings.fullName")}
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("Settings.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("Settings.currentPassword")}
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("Settings.newPassword")}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition"
        >
          {t("Settings.saveChanges")}
        </button>
      </form>
    </div>
    </AnimatedWrapper>
  );
}
