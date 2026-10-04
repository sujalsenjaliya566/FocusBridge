"use client";

import { useFocusStore } from "@/lib/store";
import { ANALOGY_PROFILES } from "@/lib/sample-data";
import {
  Settings,
  ZapOff,
  Zap,
  AlignLeft,
  BookOpen,
  Minus,
  Plus,
} from "lucide-react";
import { clsx } from "clsx";

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const settings = useFocusStore((s) => s.settings);
  const updateSettings = useFocusStore((s) => s.updateSettings);

  return (
    <header
      className="h-14 flex items-center justify-between px-5 border-b border-borderSubtle bg-surface shrink-0"
      style={{ minHeight: "56px" }}
    >
      {/* Logo + Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accentEmerald" strokeWidth={2} />
          <span className="font-semibold text-textPrimary tracking-tight text-sm">
            FocusBridge
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-canvas rounded-full px-2.5 py-1 border border-borderSubtle">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentEmerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accentEmerald" />
          </span>
          <span className="text-xs text-textMuted font-mono">
            Gemma 2 2B (On-Device)
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {/* Bionic Fixation Toggle */}
        <button
          onClick={() =>
            updateSettings({ enableFixation: !settings.enableFixation })
          }
          title={`Bionic Fixation: ${settings.enableFixation ? "On" : "Off"}`}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
            settings.enableFixation
              ? "bg-accentEmerald/10 border-accentEmerald/40 text-accentEmerald"
              : "bg-canvas border-borderSubtle text-textMuted hover:text-textPrimary hover:border-textMuted"
          )}
        >
          {settings.enableFixation ? (
            <Zap className="w-3.5 h-3.5" />
          ) : (
            <ZapOff className="w-3.5 h-3.5" />
          )}
          Fixation
        </button>

        {/* Reading Ruler Toggle */}
        <button
          onClick={() =>
            updateSettings({ enableRuler: !settings.enableRuler })
          }
          title={`Focus Ruler: ${settings.enableRuler ? "On" : "Off"}`}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
            settings.enableRuler
              ? "bg-accentAmber/10 border-accentAmber/40 text-accentAmber"
              : "bg-canvas border-borderSubtle text-textMuted hover:text-textPrimary hover:border-textMuted"
          )}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          Ruler
        </button>

        {/* Font Size Controls */}
        <div className="flex items-center gap-0.5 border border-borderSubtle rounded-md overflow-hidden">
          <button
            onClick={() =>
              updateSettings({
                fontSize: Math.max(12, settings.fontSize - 1),
              })
            }
            className="px-2 py-1.5 hover:bg-surface text-textMuted hover:text-textPrimary transition-colors"
            title="Decrease font size"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-2 text-xs text-textMuted font-mono border-x border-borderSubtle select-none">
            {settings.fontSize}px
          </span>
          <button
            onClick={() =>
              updateSettings({
                fontSize: Math.min(32, settings.fontSize + 1),
              })
            }
            className="px-2 py-1.5 hover:bg-surface text-textMuted hover:text-textPrimary transition-colors"
            title="Increase font size"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Analogy Profile Selector */}
        <select
          value={settings.selectedProfileId}
          onChange={(e) =>
            updateSettings({ selectedProfileId: e.target.value })
          }
          className="bg-canvas border border-borderSubtle text-textMuted text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-accentEmerald focus:text-textPrimary transition-colors cursor-pointer"
          title="Analogy Profile"
        >
          {ANALOGY_PROFILES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-md border border-borderSubtle text-textMuted hover:text-textPrimary hover:border-textMuted transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
