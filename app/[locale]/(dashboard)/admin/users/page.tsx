"use client";

import { useTranslations } from "next-intl";

export default function AdminUsersPage() {
  const t = useTranslations("admin");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E6B]">{t("users_title")}</h1>
        <p className="text-sm text-gray-500 mt-1">Management interfaces for {t("tab_users")}, {t("tab_consultants")}, etc.</p>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
        User management specific pages and tabs can be implemented further here.
      </div>
    </div>
  );
}
