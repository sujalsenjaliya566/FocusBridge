"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AnalysisStatus,
  CognitiveAnalysis,
  EngineProgress,
  ReaderSettings,
} from "@/types";

interface FocusState {
  documentText: string;
  documentTitle: string;
  selectedPassage: string;
  activeParagraphIndex: number;
  analysisStatus: AnalysisStatus;
  currentAnalysis: CognitiveAnalysis | null;
  engineProgress: EngineProgress;
  errorMessage: string;
  settings: ReaderSettings;

  setDocumentText: (text: string) => void;
  setDocumentTitle: (title: string) => void;
  setSelectedPassage: (passage: string) => void;
  setActiveParagraphIndex: (index: number) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setCurrentAnalysis: (analysis: CognitiveAnalysis | null) => void;
  setEngineProgress: (progress: EngineProgress) => void;
  setErrorMessage: (message: string) => void;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      documentText: "",
      documentTitle: "",
      selectedPassage: "",
      activeParagraphIndex: 0,
      analysisStatus: "idle",
      currentAnalysis: null,
      engineProgress: { text: "", percent: 0 },
      errorMessage: "",
      settings: {
        fontSize: 18,
        lineHeight: 1.85,
        letterSpacing: 0.02,
        enableFixation: true,
        enableRuler: true,
        selectedProfileId: "automation",
        engineMode: "webllm",
        ollamaEndpoint: "http://localhost:11434",
      },

      setDocumentText: (text) => set({ documentText: text }),
      setDocumentTitle: (title) => set({ documentTitle: title }),
      setSelectedPassage: (passage) => set({ selectedPassage: passage }),
      setActiveParagraphIndex: (index) =>
        set({ activeParagraphIndex: index }),
      setAnalysisStatus: (status) => set({ analysisStatus: status }),
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      setEngineProgress: (progress) => set({ engineProgress: progress }),
      setErrorMessage: (message) => set({ errorMessage: message }),
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: "focus-bridge-storage",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
