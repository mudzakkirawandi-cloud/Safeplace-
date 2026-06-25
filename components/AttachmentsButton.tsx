import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Paperclip, X, Download } from "lucide-react";
import Image from "next/image";

interface Attachment {
  id: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export default function AttachmentsButton({ reportId }: { reportId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAttachments = async () => {
      const { data } = await supabase
        .from("report_attachments")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });
      setAttachments(data || []);
      setLoading(false);
    };
    fetchAttachments();
  }, [reportId, supabase]);

  if (loading) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={attachments.length === 0}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
          attachments.length === 0
            ? "text-gray-400 border-gray-200 cursor-not-allowed"
            : "text-[#1B4F72] border-[#1B4F72]/30 hover:bg-[#1B4F72]/5"
        }`}
      >
        <Paperclip className="w-4 h-4" />
        Lampiran {attachments.length > 0 && `(${attachments.length})`}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#1B4F72]">Lampiran Laporan</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {attachments.map((att) => (
                <div key={att.id} className="border rounded-xl overflow-hidden bg-gray-50">
                  {att.file_type?.startsWith("image/") ? (
                    <a href={att.file_url} target="_blank" rel="noopener noreferrer">
                      <Image src={att.file_url} alt="Lampiran" width={300} height={128} className="w-full h-32 object-cover" loading="lazy" />
                    </a>
                  ) : att.file_type?.startsWith("video/") ? (
                    <video src={att.file_url} controls className="w-full h-32 object-cover" />
                  ) : att.file_type?.startsWith("audio/") ? (
                    <div className="p-3">
                      <audio src={att.file_url} controls className="w-full" />
                    </div>
                  ) : (
                    <a
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-32 gap-2 text-xs text-gray-500"
                    >
                      <Download className="w-4 h-4" /> File
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

