"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, MoreHorizontal, Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminConsultantsPage() {
  const t = useTranslations("admin");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Dummy data
  const CONSULTANTS = [
    { id: "1", name: "Dr. Ratna, M.Psi", type: "Profesional", campus: "-", activeCases: 4, status: "active" },
    { id: "2", name: "Budi Santoso", type: "Volunteer", campus: "Universitas SafePlace", activeCases: 2, status: "invited" },
    { id: "3", name: "Siti Aminah", type: "Volunteer", campus: "Universitas SafePlace", activeCases: 0, status: "expired" },
    { id: "4", name: "Dr. Hendra (Tidak Aktif)", type: "Profesional", campus: "-", activeCases: 0, status: "archived" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{t("status_active")}</span>;
      case "invited":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">{t("status_invited")}</span>;
      case "expired":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">{t("status_expired")}</span>;
      case "archived":
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{t("status_archived")}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E6B]">{t("consultants_title")}</h1>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4ECDC4] hover:bg-[#3dbdb4] text-white text-sm font-semibold rounded-xl transition-all"
        >
          <Plus size={16} />
          {t("btn_invite_consultant")}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">{t("field_name")}</th>
                <th className="px-6 py-4">{t("field_type")}</th>
                <th className="px-6 py-4">{t("field_campus")}</th>
                <th className="px-6 py-4 text-center">Kasus</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CONSULTANTS.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#2C3E6B]">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.type}</td>
                  <td className="px-6 py-4 text-gray-500">{c.campus}</td>
                  <td className="px-6 py-4 text-center text-gray-700 font-medium">{c.activeCases}</td>
                  <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {c.status === 'expired' && (
                      <button className="mr-2 px-3 py-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 text-xs font-medium rounded-lg transition-colors">
                        {t("btn_resend_invite")}
                      </button>
                    )}
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-400">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Undang Konsultan */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg text-[#2C3E6B]">{t("modal_invite_title")}</h2>
                <button onClick={() => setIsInviteModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-1">
                <p className="text-sm text-gray-500 mb-6">{t("modal_invite_desc")}</p>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E6B] mb-1">{t("field_name")}</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E6B] mb-1">{t("field_email")}</label>
                      <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E6B] mb-1">{t("field_phone")}</label>
                      <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E6B] mb-1">{t("field_type")}</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="radio" name="type" className="text-[#4ECDC4] focus:ring-[#4ECDC4]" defaultChecked /> {t("type_volunteer")}
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="radio" name="type" className="text-[#4ECDC4] focus:ring-[#4ECDC4]" /> {t("type_professional")}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E6B] mb-1">{t("field_education")}</label>
                    <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E6B] mb-1">{t("field_experience")}</label>
                    <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E6B] mb-1">{t("field_campus")}</label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50 bg-white">
                        <option value="">- Tidak ada -</option>
                        <option value="1">Universitas SafePlace</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E6B] mb-1">{t("field_max_cases")}</label>
                      <input type="number" defaultValue={10} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                  {t("btn_cancel")}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#4ECDC4] hover:bg-[#3dbdb4] text-white text-sm font-semibold rounded-xl transition-all">
                  <Mail size={16} />
                  {t("btn_send_invite")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
