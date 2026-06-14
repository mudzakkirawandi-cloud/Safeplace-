"use client";

import { useTranslations } from "next-intl";

export default function AdminOperatorsPage() {
  const t = useTranslations("admin");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E6B]">{t("tab_operators")} Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage community operators who oversee reports per campus.</p>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
        Operator management list will be implemented here.
      </div>
    </div>
  );
}
