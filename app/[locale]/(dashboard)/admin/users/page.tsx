"use client";

import { useTranslations } from "next-intl";

export default function AdminUsersPage() {
  const t = useTranslations("admin");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">{t("users_title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">Management interfaces for {t("tab_users")}, {t("tab_consultants")}, etc.</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
        User management specific pages and tabs can be implemented further here.
      </div>
    </div>
  );
}
