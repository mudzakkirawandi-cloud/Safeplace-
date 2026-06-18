"use client";

import { useTranslations } from "next-intl";

export default function AdminOperatorsPage() {
  const t = useTranslations("admin");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">{t("tab_operators")} Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage community operators who oversee reports per campus.</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
        Operator management list will be implemented here.
      </div>
    </div>
  );
}
