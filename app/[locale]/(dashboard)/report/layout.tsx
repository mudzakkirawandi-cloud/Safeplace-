import { ReactNode } from "react";
import { ReportProvider } from "../../_contexts/ReportContext";
import PanicButton from "../../_components/PanicButton";

export default function ReportLayout({ children }: { children: ReactNode }) {
  return (
    <ReportProvider>
      <div className="min-h-screen bg-[#F0F7FC] flex flex-col">
        {children}
        <PanicButton />
      </div>
    </ReportProvider>
  );
}
