"use client";

import { Bot, KeyRound, SearchCheck } from "lucide-react";

import type { AgentMode } from "@/lib/types";

interface ModeBadgeProps {
  mode: AgentMode;
  searchMock: boolean;
}

export default function ModeBadge({ mode, searchMock }: ModeBadgeProps) {
  return (
    <div className="glass-panel flex flex-wrap items-center gap-2 rounded-lg p-3">
      <span
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${
          mode === "gemini"
            ? "border border-neonPurple/30 bg-neonPurple/15 text-purple-100"
            : "border border-warningAmber/30 bg-warningAmber/10 text-amber-100"
        }`}
      >
        <Bot className="h-3.5 w-3.5" />
        {mode === "gemini" ? "Gemini Mode" : "Mock Fallback"}
      </span>
      <span
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${
          searchMock
            ? "border border-warningAmber/30 bg-warningAmber/10 text-amber-100"
            : "border border-successGreen/30 bg-successGreen/10 text-emerald-100"
        }`}
      >
        <SearchCheck className="h-3.5 w-3.5" />
        {searchMock ? "Tavily Fallback" : "Tavily Search Active"}
      </span>
      <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-semibold text-slate-300">
        <KeyRound className="h-3.5 w-3.5 text-electricBlue" />
        Server-side keys
      </span>
    </div>
  );
}
