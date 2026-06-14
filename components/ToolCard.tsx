"use client";

import { Calculator, CloudRain, ExternalLink, Search, Wind } from "lucide-react";

import type { AgentStep, CalculatorResult, SearchToolResult, ToolResult, WeatherResult } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

interface ToolCardProps {
  step: AgentStep & { result: ToolResult };
}

function isWeatherResult(result: ToolResult): result is WeatherResult {
  return "conditionText" in result;
}

function isCalculatorResult(result: ToolResult): result is CalculatorResult {
  return "formattedResult" in result;
}

function isSearchResult(result: ToolResult): result is SearchToolResult {
  return "results" in result;
}

function CardShell({
  title,
  icon,
  duration,
  children
}: {
  title: string;
  icon: React.ReactNode;
  duration: number;
  children: React.ReactNode;
}) {
  return (
    <article className="tool-result-panel glass-panel rounded-lg p-4 transition hover:-translate-y-1 hover:border-electricBlue/40 hover:shadow-glow">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-electricBlue/25 bg-electricBlue/10 text-electricBlue">
            {icon}
          </span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.055] px-2.5 py-1 text-xs text-slate-300">
          {formatDuration(duration)}
        </span>
      </div>
      {children}
    </article>
  );
}

export default function ToolCard({ step }: ToolCardProps) {
  const result = step.result;

  if (isWeatherResult(result)) {
    return (
      <CardShell title="Weather Tool" icon={<CloudRain className="h-4 w-4" />} duration={step.durationMs}>
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-normal text-slate-500">City</p>
              <p className="mt-1 text-lg font-semibold text-white">{result.city}</p>
            </div>
            <p className="text-3xl font-semibold text-white">{Math.round(result.temperature)}°C</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Condition</p>
              <p className="mt-1 font-medium text-slate-100">{result.conditionText}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Humidity</p>
              <p className="mt-1 font-medium text-slate-100">{result.humidity}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Rain</p>
              <p className="mt-1 font-medium text-slate-100">{result.rain} mm</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Precipitation</p>
              <p className="mt-1 font-medium text-slate-100">{result.precipitationProbabilityMax}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <Wind className="h-4 w-4 shrink-0 text-electricBlue" />
            <span>{result.windSpeed} km/h wind</span>
          </div>
          <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 leading-6 text-emerald-100">
            {result.recommendation}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <span>Source: {result.source}</span>
            {result.isFallback ? <span className="text-amber-200">Fallback data</span> : null}
          </div>
        </div>
      </CardShell>
    );
  }

  if (isCalculatorResult(result)) {
    return (
      <CardShell title="Calculator Tool" icon={<Calculator className="h-4 w-4" />} duration={step.durationMs}>
        <div className="space-y-4 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-normal text-slate-500">Expression</p>
            <p className="mt-1 rounded-lg border border-white/10 bg-slate-950/70 p-3 font-mono text-sky-100">
              {result.expression}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-normal text-slate-500">Result</p>
            <p className="mt-1 text-3xl font-semibold text-white">{result.formattedResult}</p>
          </div>
          <p className="rounded-lg border border-white/10 bg-white/[0.045] p-3 leading-6">{result.explanation}</p>
          <p className="text-xs text-slate-400">Source: {result.source}</p>
        </div>
      </CardShell>
    );
  }

  if (isSearchResult(result)) {
    return (
      <CardShell title="Web Search Tool" icon={<Search className="h-4 w-4" />} duration={step.durationMs}>
        <div className="space-y-4 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-normal text-slate-500">Query</p>
            <p className="mt-1 leading-6 text-slate-100">{result.query}</p>
          </div>
          {result.isMock ? (
            <p className="rounded-lg border border-amber-400/25 bg-amber-400/10 p-3 leading-6 text-amber-100">
              Add TAVILY_API_KEY to enable real search.
            </p>
          ) : null}
          <div className="space-y-3">
            {result.results.map((item, index) => (
              <div key={`${item.title}-${index}`} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-2 font-semibold text-sky-100 hover:text-electricBlue"
                  >
                    <span>{item.title}</span>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  </a>
                ) : (
                  <p className="font-semibold text-sky-100">{item.title}</p>
                )}
                <p className="mt-1 leading-6 text-slate-400">{item.content}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">Source: {result.source}</p>
        </div>
      </CardShell>
    );
  }

  return null;
}
