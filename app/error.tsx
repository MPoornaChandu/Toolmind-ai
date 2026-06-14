"use client";

import { RotateCcw } from "lucide-react";

import ErrorMessage from "@/components/ErrorMessage";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <section className="glass-panel w-full max-w-xl rounded-lg p-6">
        <ErrorMessage title="ToolMind AI hit a recoverable error" message={error.message} />
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-electricBlue/50 hover:bg-electricBlue/15"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </section>
    </main>
  );
}
