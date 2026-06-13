"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ReportPath = "anonymous" | "identified" | null;
type ReportMode = "victim" | "witness" | null;
type ReportIntent = "document" | "consult" | "satgas" | null;

interface ReportState {
  path: ReportPath;
  mode: ReportMode;
  intent: ReportIntent;
  formData: any; // Will type properly in Fase 3C
}

interface ReportContextType {
  state: ReportState;
  setPath: (path: ReportPath) => void;
  setMode: (mode: ReportMode) => void;
  setIntent: (intent: ReportIntent) => void;
  setFormData: (data: any) => void;
}

const defaultState: ReportState = {
  path: null,
  mode: null,
  intent: null,
  formData: {},
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReportState>(defaultState);

  const setPath = (path: ReportPath) => setState((s) => ({ ...s, path }));
  const setMode = (mode: ReportMode) => setState((s) => ({ ...s, mode }));
  const setIntent = (intent: ReportIntent) => setState((s) => ({ ...s, intent }));
  const setFormData = (data: any) => setState((s) => ({ ...s, formData: { ...s.formData, ...data } }));

  return (
    <ReportContext.Provider value={{ state, setPath, setMode, setIntent, setFormData }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReportContext() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReportContext must be used within a ReportProvider");
  }
  return context;
}
