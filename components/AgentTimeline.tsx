"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Calculator,
  CheckCircle2,
  CloudSun,
  Loader2,
  Search,
  Sparkles,
  Wrench
} from "lucide-react";

import type { AgentStep } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

interface AgentTimelineProps {
  steps: AgentStep[];
  isLoading: boolean;
}

function getStepIcon(step: AgentStep) {
  if (step.status === "error" || step.type === "error") return AlertTriangle;
  if (step.status === "running") return Loader2;
  if (step.type === "thinking") return Brain;
  if (step.type === "final") return Sparkles;
  if (step.toolName === "calculator") return Calculator;
  if (step.toolName === "weather") return CloudSun;
  if (step.toolName === "web_search") return Search;
  return Wrench;
}

function statusClasses(step: AgentStep) {
  if (step.status === "error") return "border-errorRose/40 bg-errorRose/10 text-rose-100";
  if (step.status === "running") return "border-electricBlue/40 bg-electricBlue/10 text-sky-100";
  return "border-successGreen/30 bg-successGreen/10 text-emerald-100";
}

function nodeClasses(step: AgentStep) {
  if (step.status === "error" || step.type === "error") return "border-errorRose/50 text-errorRose shadow-[0_0_24px_rgba(244,63,94,0.25)]";
  if (step.type === "tool") return "border-neonPurple/55 text-purple-100 shadow-[0_0_28px_rgba(168,85,247,0.3)]";
  if (step.status === "completed") return "border-successGreen/45 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.22)]";
  return "border-electricBlue/50 text-electricBlue shadow-[0_0_24px_rgba(56,189,248,0.24)]";
}

function buildLoadingStep(): AgentStep {
  const now = Date.now();

  return {
    id: "loading-step",
    type: "thinking",
    title: "Agent is thinking",
    description: "The request is being routed through the agent API.",
    status: "running",
    startedAt: now,
    endedAt: now,
    durationMs: 0
  };
}

export default function AgentTimeline({ steps, isLoading }: AgentTimelineProps) {
  const visibleSteps = steps.length > 0 ? steps : isLoading ? [buildLoadingStep()] : [];
  const hasToolSteps = visibleSteps.some((step) => step.type === "tool");
  const completedSteps = visibleSteps.filter((step) => step.status === "completed").length;
  const lineFill = visibleSteps.length > 0 ? Math.max(18, (completedSteps / visibleSteps.length) * 100) : 0;

  return (
    <section className="timeline-scan-panel glass-panel relative overflow-hidden rounded-lg p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Agent Timeline</h2>
          <p className="mt-1 text-sm text-slate-400">Thinking, tool calls, results, and final synthesis.</p>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-medium text-slate-300">
          {visibleSteps.length} steps
        </span>
      </div>

      {visibleSteps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-6 text-center text-sm leading-6 text-slate-400">
          Run a prompt to watch the agent choose tools and return a final answer.
        </div>
      ) : (
        <div className="relative space-y-4 pl-10">
          <div
            className={cn(
              "absolute left-[17px] top-2 h-[calc(100%-1rem)] w-px bg-white/10",
              hasToolSteps ? "shadow-[0_0_24px_rgba(168,85,247,0.45)]" : ""
            )}
          />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${lineFill}%` }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute left-[17px] top-2 w-px bg-gradient-to-b from-electricBlue via-neonPurple to-successGreen shadow-[0_0_28px_rgba(56,189,248,0.5)]"
          />

          {visibleSteps.map((step, index) => {
            const Icon = getStepIcon(step);
            const isFinal = step.type === "final";
            const isError = step.status === "error";
            const isRunning = step.status === "running";
            const isTool = step.type === "tool";

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 28, scale: 0.98, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.36, delay: index * 0.08 }}
                className={cn(
                  "relative rounded-lg border bg-white/[0.055] p-4 backdrop-blur-md transition hover:border-electricBlue/40 hover:shadow-glow",
                  isFinal
                    ? "border-electricBlue/50 shadow-glow"
                    : isError
                      ? "border-errorRose/35"
                      : isTool
                        ? "border-neonPurple/30"
                        : "border-white/10"
                )}
              >
                <div
                  className={cn(
                    "absolute -left-[40px] top-4 flex h-9 w-9 items-center justify-center rounded-lg border bg-slate-950",
                    nodeClasses(step),
                    isTool ? "timeline-tool-node" : "",
                    isRunning ? "animate-pulse" : ""
                  )}
                >
                  {isRunning ? <Icon className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                </div>

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                      {step.toolName ? (
                        <span className="rounded-lg border border-neonPurple/25 bg-neonPurple/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-normal text-purple-100">
                          {step.toolName.replace("_", " ")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-semibold", statusClasses(step))}>
                      {step.status}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950/70 px-2.5 py-1 text-[11px] font-medium text-slate-300 shadow-[0_0_16px_rgba(15,23,42,0.6)]">
                      {step.status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5 text-successGreen" /> : null}
                      {formatDuration(step.durationMs)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
