import { GitBranch, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-electricBlue" />
          <span>ToolMind AI</span>
        </div>
        <a
          href="https://github.com/MPoornaChandu/Toolmind-ai"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-slate-300 transition hover:text-white"
        >
          <GitBranch className="h-4 w-4" />
          toolmind-ai
        </a>
      </div>
    </footer>
  );
}
