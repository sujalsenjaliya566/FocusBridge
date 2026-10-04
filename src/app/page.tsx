"use client";

import { useEffect, useState, useCallback } from "react";
import { useFocusStore } from "@/lib/store";
import {
  INITIAL_ACADEMIC_PASSAGE,
  INITIAL_DOCUMENT_TITLE,
  PRECOMPUTED_ANALYSIS,
} from "@/lib/sample-data";
import Header from "@/components/Header";
import ReaderPane from "@/components/ReaderPane";
import CognitivePane from "@/components/CognitivePane";
import SettingsModal from "@/components/SettingsModal";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const documentText = useFocusStore((s) => s.documentText);
  const setDocumentText = useFocusStore((s) => s.setDocumentText);
  const setDocumentTitle = useFocusStore((s) => s.setDocumentTitle);
  const setCurrentAnalysis = useFocusStore((s) => s.setCurrentAnalysis);
  const setAnalysisStatus = useFocusStore((s) => s.setAnalysisStatus);
  const activeParagraphIndex = useFocusStore((s) => s.activeParagraphIndex);
  const setActiveParagraphIndex = useFocusStore(
    (s) => s.setActiveParagraphIndex
  );

  // Bootstrap sample data on first load
  useEffect(() => {
    if (!documentText) {
      setDocumentText(INITIAL_ACADEMIC_PASSAGE);
      setDocumentTitle(INITIAL_DOCUMENT_TITLE);
      setCurrentAnalysis(PRECOMPUTED_ANALYSIS);
      setAnalysisStatus("success");
    }
  }, [
    documentText,
    setDocumentText,
    setDocumentTitle,
    setCurrentAnalysis,
    setAnalysisStatus,
  ]);

  // Compute paragraph count for keyboard navigation
  const getParagraphCount = useCallback(() => {
    return INITIAL_ACADEMIC_PASSAGE.split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0).length;
  }, []);

  // Global keyboard shortcuts: J / ArrowDown = next paragraph, K / ArrowUp = previous
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
        return;

      if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveParagraphIndex(
          Math.min(activeParagraphIndex + 1, getParagraphCount() - 1)
        );
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveParagraphIndex(Math.max(activeParagraphIndex - 1, 0));
      } else if (e.key === "Escape" && settingsOpen) {
        setSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    activeParagraphIndex,
    settingsOpen,
    setActiveParagraphIndex,
    getParagraphCount,
  ]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-canvas">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      {/* Main split-pane layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Reader Pane — 55% */}
        <section className="w-full lg:w-[55%] border-r border-borderSubtle overflow-hidden flex flex-col">
          <ReaderPane />
        </section>

        {/* Cognitive Pane — 45% */}
        <aside className="hidden lg:flex lg:w-[45%] flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-borderSubtle shrink-0">
            <h2 className="text-xs font-semibold text-textMuted uppercase tracking-widest">
              Cognitive Analysis
            </h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <CognitivePane />
          </div>
        </aside>
      </main>

      {/* Keyboard shortcut hint */}
      <div className="hidden lg:flex items-center justify-center gap-6 py-1.5 border-t border-borderSubtle bg-surface shrink-0">
        <span className="text-[10px] text-textMuted/60">
          <kbd className="font-mono bg-canvas border border-borderSubtle rounded px-1 py-0.5 text-[9px]">
            J
          </kbd>{" "}
          /{" "}
          <kbd className="font-mono bg-canvas border border-borderSubtle rounded px-1 py-0.5 text-[9px]">
            ↓
          </kbd>{" "}
          Next paragraph
        </span>
        <span className="text-[10px] text-textMuted/60">
          <kbd className="font-mono bg-canvas border border-borderSubtle rounded px-1 py-0.5 text-[9px]">
            K
          </kbd>{" "}
          /{" "}
          <kbd className="font-mono bg-canvas border border-borderSubtle rounded px-1 py-0.5 text-[9px]">
            ↑
          </kbd>{" "}
          Previous paragraph
        </span>
        <span className="text-[10px] text-textMuted/60">
          Click paragraph →{" "}
          <span className="text-accentEmerald font-medium">Deconstruct</span>{" "}
          to analyse
        </span>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
