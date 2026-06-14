"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import AgentTimeline from "@/components/AgentTimeline";
import ChatBox from "@/components/ChatBox";
import ModeBadge from "@/components/ModeBadge";
import PortalBackground from "@/components/PortalBackground";
import ToolCard from "@/components/ToolCard";
import type { AgentResponse, AgentStep, ToolResult } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function hasToolResult(step: AgentStep): step is AgentStep & { result: ToolResult } {
  return step.type === "tool" && Boolean(step.result);
}

function getSearchMock(response?: AgentResponse) {
  if (!response) return true;

  const searchStep = response.steps.find(
    (step) => step.toolName === "web_search" && step.result && "isMock" in step.result
  );

  if (!searchStep?.result || !("isMock" in searchStep.result)) {
    return true;
  }

  return searchStep.result.isMock;
}

export default function AgentDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [response, setResponse] = useState<AgentResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const toolSteps = useMemo(() => response?.steps.filter(hasToolResult) ?? [], [response]);
  const searchMock = getSearchMock(response);

  async function submitMessage(messageOverride?: string) {
    const message = (messageOverride ?? input).trim();

    if (!message || isLoading) {
      return;
    }

    setInput("");
    setIsLoading(true);
    setError(undefined);
    setResponse(undefined);
    setMessages((current) => [...current, { role: "user", content: message }]);

    try {
      const apiResponse = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = (await apiResponse.json()) as AgentResponse;
      setResponse(data);
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);

      if (!apiResponse.ok || data.error) {
        setError(data.error ?? "The agent returned a safe fallback response.");
      }
    } catch {
      setError("The agent API could not be reached. Check that the Next.js dev server is running.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="demo" className="relative overflow-hidden py-16 sm:py-20">
      <PortalBackground withPortal={false} className="opacity-45" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-electricBlue">Control center</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Watch the agent work</h2>
          <p className="mt-3 text-base leading-7 text-slate-300">
            Every answer shows the tool path, timings, and final reasoning trace.
          </p>
        </div>

        <div className="grid w-full gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <ChatBox
            input={input}
            messages={messages}
            isLoading={isLoading}
            error={error}
            onInputChange={setInput}
            onSubmit={() => void submitMessage()}
            onDemoQuestion={(question) => void submitMessage(question)}
          />

          <div className="space-y-5">
            <ModeBadge mode={response?.mode ?? "mock"} searchMock={searchMock} />
            <AgentTimeline steps={response?.steps ?? []} isLoading={isLoading} />

            <section className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">Tool Results</h2>
                <span className="rounded-lg border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs text-slate-300">
                  {toolSteps.length} tools
                </span>
              </div>

              {toolSteps.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-6 text-center text-sm leading-6 text-slate-400">
                  Tool output cards appear here after the agent runs calculator, weather, or search.
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {toolSteps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.35, delay: index * 0.08 }}
                    >
                      <ToolCard step={step} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
