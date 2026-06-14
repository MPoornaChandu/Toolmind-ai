"use client";

import { CornerDownLeft, Loader2, SendHorizontal, UserRound } from "lucide-react";
import type { KeyboardEvent } from "react";

import DemoQuestions from "@/components/DemoQuestions";
import ErrorMessage from "@/components/ErrorMessage";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBoxProps {
  input: string;
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onDemoQuestion: (question: string) => void;
}

export default function ChatBox({
  input,
  messages,
  isLoading,
  error,
  onInputChange,
  onSubmit,
  onDemoQuestion
}: ChatBoxProps) {
  const canSend = input.trim().length > 0 && !isLoading;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (canSend) {
        onSubmit();
      }
    }
  }

  return (
    <section className="control-chat-panel glass-panel flex min-h-[620px] flex-col rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Ask ToolMind AI</h2>
          <p className="mt-1 text-sm text-slate-400">Multi-step questions work best.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
          <CornerDownLeft className="h-3.5 w-3.5" />
          Agent API
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-white/10 bg-slate-950/45 p-3">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-52 items-center justify-center text-center">
            <div className="max-w-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-electricBlue/30 bg-electricBlue/10 text-electricBlue">
                <UserRound className="h-5 w-5" />
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Pick a demo question or ask for weather, calculations, current search, or a mixed task.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-electricBlue text-slate-950"
                    : "border border-white/10 bg-white/[0.06] text-slate-200"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {isLoading ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-lg border border-electricBlue/30 bg-electricBlue/10 px-4 py-3 text-sm text-sky-100">
              <Loader2 className="h-4 w-4 animate-spin" />
              Agent is thinking...
            </div>
          </div>
        ) : null}
      </div>

      {error ? <div className="mt-4"><ErrorMessage message={error} /></div> : null}

      <div className="mt-4">
        <DemoQuestions onSelect={onDemoQuestion} disabled={isLoading} />
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/60 p-3">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a tool-using question..."
          rows={4}
          className="min-h-28 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-500"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSend}
            className="inline-flex items-center gap-2 rounded-lg bg-electricBlue px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
