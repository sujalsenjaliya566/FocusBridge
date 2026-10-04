"use client";

import { useState } from "react";
import { useFocusStore } from "@/lib/store";
import {
  Brain,
  Lightbulb,
  Layers,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Cpu,
} from "lucide-react";
import { clsx } from "clsx";

export default function CognitivePane() {
  const analysisStatus = useFocusStore((s) => s.analysisStatus);
  const currentAnalysis = useFocusStore((s) => s.currentAnalysis);
  const engineProgress = useFocusStore((s) => s.engineProgress);
  const errorMessage = useFocusStore((s) => s.errorMessage);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [quizAnalysisId, setQuizAnalysisId] = useState<string | null>(null);

  // Reset quiz state when a new analysis arrives — use a stable identity string
  const analysisKey = currentAnalysis?.coreTakeaway?.slice(0, 40) ?? null;
  if (analysisKey !== quizAnalysisId) {
    setQuizAnalysisId(analysisKey);
    setSelectedOption(null);
    setSubmitted(false);
  }

  const handleSubmitAnswer = () => {
    if (selectedOption !== null) setSubmitted(true);
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-5 space-y-4">
      {/* Idle State */}
      {analysisStatus === "idle" && !currentAnalysis && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <Brain className="w-10 h-10 text-borderSubtle" />
          <p className="text-textMuted text-sm max-w-xs">
            Select a paragraph in the reader and click{" "}
            <span className="text-accentEmerald font-medium">Deconstruct</span>{" "}
            to generate a cognitive analysis.
          </p>
        </div>
      )}

      {/* Loading State */}
      {analysisStatus === "loading" && (
        <div className="rounded-xl border border-borderSubtle bg-surface p-5 space-y-3">
          <div className="flex items-center gap-2 text-accentEmerald">
            <Cpu className="w-4 h-4" />
            <span className="text-sm font-semibold">Running Gemma 2 2B…</span>
            <Loader2 className="w-4 h-4 animate-spin ml-auto" />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-textMuted font-mono">
              <span className="truncate max-w-[200px]">
                {engineProgress.text || "Initialising…"}
              </span>
              <span>{engineProgress.percent}%</span>
            </div>
            <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
              <div
                className="h-full bg-accentEmerald rounded-full transition-all duration-300"
                style={{ width: `${engineProgress.percent}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-textMuted">
            Model weights are cached after first load — subsequent analyses run
            in seconds.
          </p>
        </div>
      )}

      {/* Error State */}
      {analysisStatus === "error" && (
        <div className="rounded-xl border border-accentRose/40 bg-accentRose/5 p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-accentRose shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-accentRose">
              Analysis failed
            </p>
            <p className="text-xs text-textMuted font-mono break-all">
              {errorMessage}
            </p>
            <p className="text-xs text-textMuted">
              If using WebGPU, ensure your browser supports it. Alternatively,
              switch to Ollama mode in Settings.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Cards */}
      {currentAnalysis && (
        <>
          {/* Card 1: Core Takeaway */}
          <div className="rounded-xl border border-accentEmerald/30 bg-surface overflow-hidden">
            <div className="border-l-4 border-accentEmerald px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-accentEmerald" />
                <span className="text-xs font-semibold text-accentEmerald uppercase tracking-widest">
                  Core Takeaway
                </span>
              </div>
              <p className="text-textPrimary text-sm leading-relaxed font-medium">
                {currentAnalysis.coreTakeaway}
              </p>
            </div>
          </div>

          {/* Card 2: The Mechanics */}
          <div className="rounded-xl border border-borderSubtle bg-surface overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-borderSubtle">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accentAmber" />
                <span className="text-xs font-semibold text-accentAmber uppercase tracking-widest">
                  The Mechanics
                </span>
              </div>
            </div>
            <div className="px-4 py-3 space-y-3">
              {currentAnalysis.mechanics.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accentAmber/10 border border-accentAmber/30 text-accentAmber text-[10px] font-bold font-mono shrink-0">
                      {i + 1}
                    </span>
                    {i < currentAnalysis.mechanics.length - 1 && (
                      <div className="w-px flex-1 bg-borderSubtle mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <span className="inline-block font-mono text-xs bg-canvas border border-borderSubtle text-textMuted px-2 py-0.5 rounded mb-1">
                      {step.phase}
                    </span>
                    <p className="text-textPrimary text-sm leading-relaxed">
                      {step.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Analogy Bridge */}
          <div className="rounded-xl border border-borderSubtle bg-surface overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-borderSubtle">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accentAmber" />
                <span className="text-xs font-semibold text-accentAmber uppercase tracking-widest">
                  Analogy Bridge
                </span>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-textPrimary text-sm leading-relaxed italic">
                {currentAnalysis.analogy}
              </p>
            </div>
          </div>

          {/* Card 4: Socratic Checkpoint */}
          <div className="rounded-xl border border-borderSubtle bg-surface overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-borderSubtle">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-textMuted" />
                <span className="text-xs font-semibold text-textMuted uppercase tracking-widest">
                  Socratic Checkpoint
                </span>
              </div>
            </div>
            <div className="px-4 py-4 space-y-3">
              <p className="text-textPrimary text-sm leading-relaxed font-medium">
                {currentAnalysis.checkpoint.question}
              </p>

              <div className="space-y-2">
                {currentAnalysis.checkpoint.options.map((opt, i) => {
                  const isCorrect =
                    i === currentAnalysis.checkpoint.correctIndex;
                  const isSelected = selectedOption === i;

                  const buttonCx = clsx(
                    "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all duration-150",
                    "flex items-start gap-2",
                    !submitted && [
                      isSelected
                        ? "border-accentEmerald/60 bg-accentEmerald/10 text-textPrimary"
                        : "border-borderSubtle bg-canvas text-textMuted hover:border-textMuted hover:text-textPrimary cursor-pointer",
                    ],
                    submitted && isCorrect && [
                      "border-accentEmerald bg-accentEmerald/10 text-accentEmerald",
                    ],
                    submitted &&
                      isSelected &&
                      !isCorrect && [
                        "border-accentRose bg-accentRose/10 text-accentRose",
                      ],
                    submitted &&
                      !isSelected &&
                      !isCorrect && [
                        "border-borderSubtle bg-canvas text-textMuted opacity-50",
                      ]
                  );

                  return (
                    <button
                      key={i}
                      disabled={submitted}
                      onClick={() => setSelectedOption(i)}
                      className={buttonCx}
                    >
                      <ChevronRight
                        className={clsx(
                          "w-3.5 h-3.5 mt-0.5 shrink-0",
                          submitted && isCorrect
                            ? "text-accentEmerald"
                            : submitted && isSelected && !isCorrect
                            ? "text-accentRose"
                            : "text-textMuted"
                        )}
                      />
                      <span>{opt}</span>
                      {submitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-accentEmerald ml-auto shrink-0 mt-0.5" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-accentRose ml-auto shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {!submitted ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="w-full py-2 rounded-lg border border-accentEmerald/40 bg-accentEmerald/10 text-accentEmerald text-sm font-medium hover:bg-accentEmerald hover:text-canvas transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              ) : (
                <div
                  className={clsx(
                    "rounded-lg border px-3 py-2.5 text-sm",
                    selectedOption === currentAnalysis.checkpoint.correctIndex
                      ? "border-accentEmerald/30 bg-accentEmerald/5 text-accentEmerald"
                      : "border-accentRose/30 bg-accentRose/5 text-accentRose"
                  )}
                >
                  <p className="font-medium mb-1">
                    {selectedOption === currentAnalysis.checkpoint.correctIndex
                      ? "✓ Correct!"
                      : "✗ Not quite."}
                  </p>
                  <p className="text-xs leading-relaxed text-textMuted">
                    {currentAnalysis.checkpoint.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
