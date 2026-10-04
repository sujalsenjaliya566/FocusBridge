"use client";

import { useRef, useCallback } from "react";
import { useFocusStore } from "@/lib/store";
import { formatBionicText } from "@/lib/fixation";
import { ANALOGY_PROFILES } from "@/lib/sample-data";
import { runGemmaAnalysis } from "@/lib/gemma-engine";
import { Sparkles, Upload, FileText } from "lucide-react";
import { clsx } from "clsx";
// clsx is used for paragraph styling below

export default function ReaderPane() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentText = useFocusStore((s) => s.documentText);
  const documentTitle = useFocusStore((s) => s.documentTitle);
  const activeParagraphIndex = useFocusStore((s) => s.activeParagraphIndex);
  const analysisStatus = useFocusStore((s) => s.analysisStatus);
  const settings = useFocusStore((s) => s.settings);

  const setDocumentText = useFocusStore((s) => s.setDocumentText);
  const setDocumentTitle = useFocusStore((s) => s.setDocumentTitle);
  const setActiveParagraphIndex = useFocusStore((s) => s.setActiveParagraphIndex);
  const setAnalysisStatus = useFocusStore((s) => s.setAnalysisStatus);
  const setCurrentAnalysis = useFocusStore((s) => s.setCurrentAnalysis);
  const setEngineProgress = useFocusStore((s) => s.setEngineProgress);
  const setErrorMessage = useFocusStore((s) => s.setErrorMessage);

  const paragraphs = documentText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setDocumentText(text);
        setDocumentTitle(file.name.replace(/\.(txt|md)$/, ""));
      };
      reader.readAsText(file);
      // Reset file input so the same file can be re-uploaded
      e.target.value = "";
    },
    [setDocumentText, setDocumentTitle]
  );

  const handleDeconstruct = useCallback(
    async (passage: string) => {
      const profile = ANALOGY_PROFILES.find(
        (p) => p.id === settings.selectedProfileId
      );
      const anchor = profile?.promptAnchor ?? ANALOGY_PROFILES[0].promptAnchor;

      setAnalysisStatus("loading");
      setCurrentAnalysis(null);
      setErrorMessage("");
      setEngineProgress({ text: "Initialising…", percent: 0 });

      try {
        const analysis = await runGemmaAnalysis({
          passage,
          analogyAnchor: anchor,
          engineMode: settings.engineMode,
          ollamaEndpoint: settings.ollamaEndpoint,
          onProgress: (p) => setEngineProgress(p),
        });
        setCurrentAnalysis(analysis);
        setAnalysisStatus("success");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred.";
        setErrorMessage(message);
        setAnalysisStatus("error");
      }
    },
    [
      settings.selectedProfileId,
      settings.engineMode,
      settings.ollamaEndpoint,
      setAnalysisStatus,
      setCurrentAnalysis,
      setEngineProgress,
      setErrorMessage,
    ]
  );

  const rulerActive = settings.enableRuler;
  const fixationActive = settings.enableFixation;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-borderSubtle shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-textMuted" />
          <span className="text-sm text-textMuted font-medium truncate max-w-xs">
            {documentTitle || "No document loaded"}
          </span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-borderSubtle text-xs text-textMuted hover:text-textPrimary hover:border-accentEmerald transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Load .txt / .md
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Document Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
        {paragraphs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <FileText className="w-12 h-12 text-borderSubtle" />
            <p className="text-textMuted text-sm max-w-xs">
              Load a <code className="font-mono text-accentEmerald">.txt</code>{" "}
              or <code className="font-mono text-accentEmerald">.md</code> file
              to start reading, or the Raft Consensus sample is loaded by
              default.
            </p>
          </div>
        ) : (
          paragraphs.map((para, idx) => {
            const isActive = idx === activeParagraphIndex;
            const isDimmed = rulerActive && !isActive;

            return (
              <div
                key={idx}
                onClick={() => setActiveParagraphIndex(idx)}
                className={clsx(
                  "relative group rounded-md px-4 py-3 cursor-pointer transition-all duration-200",
                  isActive && rulerActive
                    ? "border-l-4 border-accentAmber bg-surface/80 pl-4"
                    : "border-l-4 border-transparent hover:border-borderSubtle",
                  isDimmed ? "opacity-35" : "opacity-100"
                )}
              >
                {fixationActive ? (
                  <p
                    style={{
                      fontSize: `${settings.fontSize}px`,
                      lineHeight: settings.lineHeight,
                      letterSpacing: `${settings.letterSpacing}em`,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formatBionicText(para),
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: `${settings.fontSize}px`,
                      lineHeight: settings.lineHeight,
                      letterSpacing: `${settings.letterSpacing}em`,
                    }}
                    className="text-textPrimary"
                  >
                    {para}
                  </p>
                )}

                {/* Floating Deconstruct Button */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeconstruct(para);
                    }}
                    disabled={analysisStatus === "loading"}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-accentEmerald/50 bg-canvas text-accentEmerald hover:bg-accentEmerald hover:text-canvas transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {analysisStatus === "loading" ? "Running…" : "Deconstruct with Gemma"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
