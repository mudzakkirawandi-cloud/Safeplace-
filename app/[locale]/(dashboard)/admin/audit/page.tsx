"use client";

import { useTranslations } from "next-intl";

export default function AdminAuditPage() {
  const t = useTranslations("admin");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">{t("nav_audit_log")}</h1>
        <p className="text-sm text-muted-foreground mt-1">System activity logs and audit trails.</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
        Audit log table will be implemented here.
      </div>
    </div>
  );
}
