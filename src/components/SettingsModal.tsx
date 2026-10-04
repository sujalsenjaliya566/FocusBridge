"use client";

import { useEffect, useRef } from "react";
import { useFocusStore } from "@/lib/store";
import { X, Cpu, Globe, SlidersHorizontal } from "lucide-react";
import { clsx } from "clsx";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const settings = useFocusStore((s) => s.settings);
  const updateSettings = useFocusStore((s) => s.updateSettings);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-surface border border-borderSubtle rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-borderSubtle">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-accentEmerald" />
            <span className="font-semibold text-textPrimary text-sm">
              Settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-textMuted hover:text-textPrimary hover:bg-canvas transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-5 space-y-6">
          {/* Engine Selection */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-textMuted uppercase tracking-widest">
              AI Engine
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ engineMode: "webllm" })}
                className={clsx(
                  "flex flex-col items-start gap-1.5 px-3 py-3 rounded-xl border text-left transition-all",
                  settings.engineMode === "webllm"
                    ? "border-accentEmerald/50 bg-accentEmerald/8 text-textPrimary"
                    : "border-borderSubtle bg-canvas text-textMuted hover:border-textMuted"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-accentEmerald" />
                  <span className="text-sm font-medium">WebGPU</span>
                </div>
                <span className="text-xs text-textMuted leading-tight">
                  Gemma 2 2B runs entirely in-browser via WebGPU. No server
                  required.
                </span>
              </button>

              <button
                onClick={() => updateSettings({ engineMode: "ollama" })}
                className={clsx(
                  "flex flex-col items-start gap-1.5 px-3 py-3 rounded-xl border text-left transition-all",
                  settings.engineMode === "ollama"
                    ? "border-accentAmber/50 bg-accentAmber/8 text-textPrimary"
                    : "border-borderSubtle bg-canvas text-textMuted hover:border-textMuted"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-accentAmber" />
                  <span className="text-sm font-medium">Ollama</span>
                </div>
                <span className="text-xs text-textMuted leading-tight">
                  Routes to a local Ollama daemon. Faster on machines with
                  limited VRAM.
                </span>
              </button>
            </div>
          </section>

          {/* Ollama Endpoint (shown when Ollama is selected) */}
          {settings.engineMode === "ollama" && (
            <section className="space-y-2">
              <label
                htmlFor="ollama-endpoint"
                className="text-xs font-semibold text-textMuted uppercase tracking-widest"
              >
                Ollama Endpoint
              </label>
              <input
                id="ollama-endpoint"
                type="text"
                value={settings.ollamaEndpoint}
                onChange={(e) =>
                  updateSettings({ ollamaEndpoint: e.target.value })
                }
                placeholder="http://localhost:11434"
                className="w-full bg-canvas border border-borderSubtle rounded-lg px-3 py-2 text-sm text-textPrimary font-mono focus:outline-none focus:border-accentAmber transition-colors placeholder:text-textMuted/50"
              />
              <p className="text-xs text-textMuted">
                Ensure{" "}
                <code className="font-mono text-accentAmber">
                  ollama run gemma2:2b
                </code>{" "}
                is running before deconstructing.
              </p>
            </section>
          )}

          {/* Typography Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-textMuted uppercase tracking-widest">
              Typography
            </h3>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-textMuted">
                <span>Font Size</span>
                <span className="font-mono text-textPrimary">
                  {settings.fontSize}px
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={32}
                step={1}
                value={settings.fontSize}
                onChange={(e) =>
                  updateSettings({ fontSize: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 rounded-full appearance-none bg-borderSubtle accent-accentEmerald cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-textMuted/60 font-mono">
                <span>12px</span>
                <span>32px</span>
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-textMuted">
                <span>Line Height</span>
                <span className="font-mono text-textPrimary">
                  {settings.lineHeight.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={1.2}
                max={2.8}
                step={0.05}
                value={settings.lineHeight}
                onChange={(e) =>
                  updateSettings({ lineHeight: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 rounded-full appearance-none bg-borderSubtle accent-accentEmerald cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-textMuted/60 font-mono">
                <span>1.20</span>
                <span>2.80</span>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-textMuted">
                <span>Letter Spacing</span>
                <span className="font-mono text-textPrimary">
                  {settings.letterSpacing.toFixed(3)}em
                </span>
              </div>
              <input
                type="range"
                min={-0.02}
                max={0.15}
                step={0.005}
                value={settings.letterSpacing}
                onChange={(e) =>
                  updateSettings({
                    letterSpacing: parseFloat(e.target.value),
                  })
                }
                className="w-full h-1.5 rounded-full appearance-none bg-borderSubtle accent-accentEmerald cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-textMuted/60 font-mono">
                <span>−0.02em</span>
                <span>0.15em</span>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-borderSubtle flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-accentEmerald text-canvas text-sm font-semibold hover:bg-accentEmerald/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
